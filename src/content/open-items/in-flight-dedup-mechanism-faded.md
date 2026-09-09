---
title: In-flight dedup — the mechanism faded, and came back with one prompt
kind: regression
status: closed
opened: 2026-09-07
closed: 2026-09-09
order: 3
labs: ['16-asyncsequence-detached-tasks-in-flight-dedup']
notes: ['reentrancy']
---

<p>Half of the <a href="/open#sendable-stated-backwards">week-3 recall branch</a>. Asked cold on 7 Sep, five days after it was built: <b>the goal came back and the mechanism did not</b>. The pattern exists to close the window between <em>started</em> and <em>finished</em>, and that window was the part missing.</p>

<h4>9 Sep — the first answer was recall attached to the wrong design</h4>

<p>The re-pass opened with the same question, and what came back was the <b>failure path</b> — that storing images gives no retry mechanism on failure. <b>That is backwards.</b></p>

<table>
  <tr><th>Stores</th><th>What happens when the download throws</th></tr>
  <tr><td>Images</td><td>Nothing was stored, so the dictionary <b>stays empty</b> and the next caller naturally retries</td></tr>
  <tr><td>Tasks</td><td>The failed task <b>stays in the dictionary</b> and poisons that URL forever — which is why the <code>catch</code> removes the entry</td></tr>
</table>

<p><b>So the detail was recalled correctly and attached to the wrong design.</b> That is a distinct failure from having forgotten it, and worth separating: the poisoning problem is real, it was remembered accurately, and it belongs to the <em>other</em> implementation. A gap loses the fact; this lost the fact's owner.</p>

<h4>What restored it — one prompt, reframed as timing</h4>

<p>Re-asked as a timing question rather than a design question: <em>caller one starts a 300 ms download, caller two arrives at 10 ms, what is in a <code>[URL: Image]</code> dictionary at that moment?</em> It landed immediately:</p>

<blockquote>at 10 ms we'll have the Task instance so the 2nd caller won't create a new task for the same url</blockquote>

<p><b>Correct.</b> The gap between started and finished is what the task fills, and it is the entire point of the pattern. An image dictionary is empty for the whole 300 ms, which is exactly the window the second caller arrives in.</p>

<p><span class="corrected">one correction</span> <b>"it'll execute the same"</b> — caller two executes nothing. It awaits the existing task's <code>value</code>. One download, five awaits, all resuming together when it completes.</p>

<h4>Why this closes rather than being carried</h4>

<p><b>It came back with one prompt, and the prompt only changed the question's frame — no fact was supplied.</b> That is what repair should look like, and it is the distinction this item exists to make: <em>decay is not the same as never having learned it</em>. Compare <a href="/open#the-424-stale-maxfreq-safety-argument">the 424 safety argument</a>, which has now failed three attempts and is parked — that one has never had a version to restore.</p>

<p>Both halves of the branch behaved the same way on the same morning, which makes it evidence rather than a single data point: <b>a mechanism that was genuinely understood is cheap to restore; the expensive thing is one that never landed.</b> The corollary is unwelcome — a re-pass being quick says nothing about whether it will survive the next gap, which is the mistake <a href="/open#sendable-stated-backwards">the 31 Aug close made</a>.</p>
