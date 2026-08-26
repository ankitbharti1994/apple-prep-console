// main.swift
//
// The @unchecked Sendable read gap, made observable.
//
//   swiftc -sanitize=thread -g -Onone main.swift -o demo && ./demo
//
// Two classes, identical except for one line: whether the READ
// takes the lock. Both compile without complaint, because
// @unchecked switches the checker off.

import Foundation

// MARK: - The two implementations

/// Writes are synchronized. Reads are not.
/// This is the shape most candidates describe as "safe".
final class Broken: @unchecked Sendable {
    private let lock = NSLock()
    private var count = 0

    func increment() {
        lock.lock()
        count += 1
        lock.unlock()
    }

    var value: Int { count }        // ← unsynchronized read. This is the race.
}

/// Every access synchronized, reads included.
final class Guarded: @unchecked Sendable {
    private let lock = NSLock()
    private var count = 0

    func increment() {
        lock.lock()
        count += 1
        lock.unlock()
    }

    var value: Int {
        lock.lock()
        defer { lock.unlock() }
        return count
    }
}

// MARK: - Harness

let iterations = 10_000

/// Interleaves N increments with N reads across the cooperative pool,
/// so readers and writers genuinely overlap.
func hammer(
    increment: @escaping @Sendable () -> Void,
    read: @escaping @Sendable () -> Int
) async {
    await withTaskGroup(of: Void.self) { group in
        for _ in 0..<iterations {
            group.addTask { increment() }
            group.addTask {
                let observed = read()
                // A use the optimizer cannot discard, so the read
                // survives even if you rebuild with -O.
                if observed < 0 { fatalError("impossible") }
            }
        }
    }
}

// MARK: - Run

let broken = Broken()
await hammer(increment: { broken.increment() }, read: { broken.value })
print("Broken   expected \(iterations), got \(broken.value)")

let guarded = Guarded()
await hammer(increment: { guarded.increment() }, read: { guarded.value })
print("Guarded  expected \(iterations), got \(guarded.value)")

print("""

Now read stderr, not stdout. The counts above are not the finding.
""")
