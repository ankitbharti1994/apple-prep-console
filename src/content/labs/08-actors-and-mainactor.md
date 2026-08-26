---
title: Actors and @MainActor, in short
day: 2026-08-25
order: 3
tags: ['actors', 'concurrency']
intro: An actor is a reference type that protects its own mutable state. Its stored properties are reachable synchronously only from inside; from outside, only via await.
---

<pre><span class="kw">actor</span> <span class="ty">ImageCache</span> {
    <span class="kw">private var</span> cache: [<span class="ty">URL</span>: <span class="ty">UIImage</span>] = [:]

    <span class="kw">func</span> image(for url: <span class="ty">URL</span>) -&gt; <span class="ty">UIImage</span>? { cache[url] }   <span class="cm">// no await inside</span>
    <span class="kw">func</span> store(_ img: <span class="ty">UIImage</span>, for url: <span class="ty">URL</span>) { cache[url] = img }
}

<span class="kw">let</span> img = <span class="kw">await</span> cache.image(for: url)   <span class="cm">// await from outside</span></pre>

<p>Crucially this is <b>not a lock</b>. Calls suspend rather than block, so the thread goes off to do other work. No priority inversion, no deadlock from lock ordering.</p>

<h3>@MainActor</h3>
<p>A global actor for the main thread. What it guarantees is <em>isolation</em>; the runtime satisfies that by running the code on the main thread.</p>
<table>
  <tr><th>Construct</th><th>Inherits main-actor isolation?</th></tr>
  <tr><td>@MainActor on a type</td><td>Yes — all members, unless marked <code>nonisolated</code></td></tr>
  <tr><td>Task { } inside it</td><td>Yes — stays on the main actor</td></tr>
  <tr><td>Task.detached { }</td><td><b>No</b> — the usual source of "why is my UI update on a background thread"</td></tr>
</table>

<h3>What conforms to Sendable automatically</h3>
<table>
  <tr><th>Conforms</th><th>Does not</th></tr>
  <tr><td>Value types with all-Sendable stored properties</td><td>Any non-final class</td></tr>
  <tr><td>actor types, always</td><td>A class with <code>var</code> properties</td></tr>
  <tr><td>final class with only immutable lets</td><td>A struct holding a class reference</td></tr>
  <tr><td>@Sendable functions</td><td>— yesterday's Snapshot is exactly this case</td></tr>
</table>
