import { useCallback, useEffect, useState } from 'react';
import { buildReviewQueue, PROBLEM_INTERVALS, UPCOMING_HORIZON_DAYS, type ReviewableProblem, type ReviewableOpenItem, type ReviewableNextStep, type ReviewQueue } from '~/lib/review';
import { todayISO, formatShort, msUntilNextMidnight } from '~/lib/progress';
import { prep } from '../../../prep.config';

export interface Props {
  problems: ReviewableProblem[];
  openItems: ReviewableOpenItem[];
  nextSteps: ReviewableNextStep[];
}

export default function ReviewQueue({ problems, openItems, nextSteps }: Props) {
  const [queue, setQueue] = useState<ReviewQueue>(() =>
    buildReviewQueue(todayISO(), { problems, openItems, nextSteps }),
  );

  const rebuild = useCallback(() => {
    setQueue(buildReviewQueue(todayISO(), { problems, openItems, nextSteps }));
  }, [problems, openItems, nextSteps]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const scheduleMidnightRefresh = () => {
      timeoutId = setTimeout(() => {
        rebuild();
        scheduleMidnightRefresh();
      }, msUntilNextMidnight());
    };

    const onVisibility = () => {
      if (document.hidden) return;
      rebuild();
      if (timeoutId) clearTimeout(timeoutId);
      scheduleMidnightRefresh();
    };

    const onFocus = () => {
      rebuild();
      if (timeoutId) clearTimeout(timeoutId);
      scheduleMidnightRefresh();
    };

    scheduleMidnightRefresh();
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onFocus);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onFocus);
    };
  }, [rebuild]);

  const { due, upcoming, counts, today } = queue;

  return (
    <>
      <div className="metrics">
        <div className="metric">
          <div className="lb">Due / overdue</div>
          <div className="vv">{counts.due}</div>
          <div className="sub">across all tracks</div>
        </div>
        <div className="metric">
          <div className="lb">Problems</div>
          <div className="vv">{counts.problems}</div>
          <div className="sub">at review intervals</div>
        </div>
        <div className="metric">
          <div className="lb">Open items</div>
          <div className="vv">{counts.open}</div>
          <div className="sub">due or overdue</div>
        </div>
        <div className="metric">
          <div className="lb">Next steps</div>
          <div className="vv">{counts.nextSteps}</div>
          <div className="sub">still in flight</div>
        </div>
      </div>

      {due.length > 0 ? (
        <>
          <h2 className="sec">Due · {formatShort(today)}</h2>
          <table className="ptable">
            <thead>
              <tr><th>Kind</th><th>What</th><th>Why it’s here</th></tr>
            </thead>
            <tbody>
              {due.map((item) => (
                <tr key={`${item.kind}-${item.title}`}>
                  <td><span className="tag">{item.kind}</span></td>
                  <td><a href={item.href}>{item.title}</a></td>
                  <td>{item.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <p className="stripnote">
          Nothing scheduled for {formatShort(today)}. The queue refreshes as problems age and open items move.
        </p>
      )}

      {upcoming.length > 0 && (
        <>
          <h2 className="sec">Next {UPCOMING_HORIZON_DAYS} days</h2>
          <table className="ptable">
            <thead>
              <tr><th>Due</th><th>Kind</th><th>What</th><th>Why it’s coming</th></tr>
            </thead>
            <tbody>
              {upcoming.map((item) => (
                <tr key={`${item.kind}-${item.title}-${item.due}`}>
                  <td>{item.due === 'today' ? 'today' : formatShort(item.due)}</td>
                  <td><span className="tag">{item.kind}</span></td>
                  <td><a href={item.href}>{item.title}</a></td>
                  <td>{item.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <div className="colophon">
        <span>{prep.currentTopic.name} · target {prep.currentTopic.target}</span>
        <span>Problem review intervals: {PROBLEM_INTERVALS.join(', ')} days</span>
      </div>
    </>
  );
}
