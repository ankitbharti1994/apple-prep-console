// proofs.swift — verify today's internals claims instead of trusting them.
//
//   swift proofs.swift
//
// For the two claims marked SIL, run instead:
//   swiftc -emit-sil proofs.swift | grep -E 'alloc_stack|alloc_ref|alloc_box'
//   swiftc -O -emit-sil proofs.swift | grep -E 'strong_retain|strong_release'

import Foundation

// ---------------------------------------------------------------- helpers

extension Array {
    /// Address of the heap buffer. Reading does not trigger a copy.
    var bufferAddress: UInt {
        withUnsafeBufferPointer { buf -> UInt in
            guard let base = buf.baseAddress else { return 0 }
            return UInt(bitPattern: UnsafeRawPointer(base))
        }
    }
}

func address<T>(of value: inout T) -> UInt {
    withUnsafePointer(to: &value) { UInt(bitPattern: UnsafeRawPointer($0)) }
}

func hex(_ v: UInt) -> String { v == 0 ? "nil" : "0x" + String(v, radix: 16) }

func section(_ title: String) {
    print("\n\u{001B}[1m── \(title)\u{001B}[0m")
}

func check(_ label: String, _ passed: Bool) {
    print("  \(passed ? "PASS" : "FAIL")  \(label)")
}

// ---------------------------------------------------------------- 1. copy-on-write

section("1. Assignment is O(1); the copy waits for a mutation")

var a = [1, 2, 3]
let addr0 = a.bufferAddress
print("  a           buffer \(hex(addr0))")

let b = a
print("  let b = a   buffer \(hex(b.bufferAddress))")
check("assignment shared the buffer, no copy", b.bufferAddress == addr0)

a.append(4)
print("  a.append(4) buffer \(hex(a.bufferAddress))")
check("mutation while shared allocated a new buffer", a.bufferAddress != addr0)
check("b still points at the original", b.bufferAddress == addr0)

let addr1 = a.bufferAddress
a.append(5)
check("second mutation is in place — a now owns it uniquely",
      a.bufferAddress == addr1)

// ---------------------------------------------------------------- 2. uniqueness check

section("2. isKnownUniquelyReferenced is what drives the decision")

final class Buffer { var data: [Int] = [] }

var box = Buffer()
check("one owner → unique", isKnownUniquelyReferenced(&box))

var second = box
check("two owners → not unique", !isKnownUniquelyReferenced(&box))

second = Buffer()               // drop the second reference
check("back to one owner → unique again", isKnownUniquelyReferenced(&box))
_ = second

// ---------------------------------------------------------------- 3. shallow copy

section("3. A struct with a class property copies shallowly")

struct Naive {
    var name: String
    var buffer = Buffer()
}

let original = Naive(name: "original")
var copy = original
copy.name = "copy"
copy.buffer.data.append(1)

check("name is independent", original.name == "original")
check("buffer is SHARED — same object",
      ObjectIdentifier(original.buffer) == ObjectIdentifier(copy.buffer))
check("mutation is visible through the `let`", original.buffer.data == [1])
print("  original.name = \"\(original.name)\", original.buffer.data = \(original.buffer.data)")

// the copy-on-write fix
struct Protected {
    private var storage = Buffer()
    var data: [Int] {
        get { storage.data }
        set {
            if !isKnownUniquelyReferenced(&storage) {
                let fresh = Buffer()
                fresh.data = storage.data
                storage = fresh
            }
            storage.data = newValue
        }
    }
}

let safeOriginal = Protected()
var safeCopy = safeOriginal
safeCopy.data.append(1)
check("CoW version restores value semantics", safeOriginal.data.isEmpty)

// ---------------------------------------------------------------- 4. layout

section("4. Layout is observable")

struct TwoInts { var x: Int; var y: Int }
struct WithRef  { var x: Int; var box: Buffer }

print("  MemoryLayout<Int>.size          = \(MemoryLayout<Int>.size)")
print("  MemoryLayout<TwoInts>.size      = \(MemoryLayout<TwoInts>.size)")
print("  MemoryLayout<WithRef>.size      = \(MemoryLayout<WithRef>.size)")
print("  MemoryLayout<Buffer>.size       = \(MemoryLayout<Buffer>.size)   ← just the reference")
check("a class variable is pointer-sized", MemoryLayout<Buffer>.size == MemoryLayout<UnsafeRawPointer>.size)

// ---------------------------------------------------------------- 5. retain cycles

section("5. Retain cycles are proven by deinit never running")

final class Node {
    let name: String
    var onEvent: (() -> Void)?
    init(name: String) { self.name = name }
    deinit { print("  deinit ran for \(name)") }
}

func makeLeak() {
    let node = Node(name: "leaked")
    node.onEvent = { print("  \(node.name) handled an event") }   // strong capture of self
}

func makeClean() {
    let node = Node(name: "clean")
    node.onEvent = { [weak node] in
        guard let node else { return }
        print("  \(node.name) handled an event")
    }
}

print("  calling makeLeak()  — expect NO deinit line:")
makeLeak()
print("  calling makeClean() — expect a deinit line:")
makeClean()
print("  (if only one deinit printed, the cycle is confirmed)")

// ---------------------------------------------------------------- 6. quadratic CoW

section("6. Re-sharing every iteration turns O(n) into O(n squared)")

func linearAppends(_ n: Int) -> TimeInterval {
    var store: [Int] = []
    let t0 = Date()
    for i in 0..<n { store.append(i) }
    return Date().timeIntervalSince(t0)
}

func resharedAppends(_ n: Int) -> TimeInterval {
    var store: [Int] = []
    var history: [[Int]] = []
    let t0 = Date()
    for i in 0..<n {
        history.append(store)   // re-shares the buffer → next append must copy
        store.append(i)
    }
    return Date().timeIntervalSince(t0)
}

for n in [2_000, 4_000, 8_000] {
    let lin = linearAppends(n)
    let quad = resharedAppends(n)
    print(String(format: "  n = %5d   in place %.4fs   re-shared %.4fs", n, lin, quad))
}
print("  Doubling n should roughly double the first column and quadruple the second.")

// ---------------------------------------------------------------- 7. SIL only

section("7. Two claims that only SIL can settle")

print("""
  Allocation site — struct local vs struct inside a class:
      swiftc -emit-sil proofs.swift | grep -E 'alloc_stack|alloc_ref|alloc_box'
    alloc_stack = stack slot, alloc_ref = heap instance, alloc_box = boxed capture.

  ARC release placement — why unowned crashes are nondeterministic:
      swiftc -O -emit-sil proofs.swift | grep -E 'strong_retain|strong_release'
    Compare -Onone against -O and watch the release move earlier than the
    closing brace. That movement is exactly what withExtendedLifetime blocks.
""")

print("\nDone.\n")
