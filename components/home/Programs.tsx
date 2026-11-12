import { programs, sheets } from "@/lib/content/site";
import SheetHead from "@/components/site/SheetHead";
import ProgramRow from "./ProgramRow";
import ProgramsStory from "./ProgramsStory";

const Seal = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.3" />
    <path d="M4.8 8.2l2.1 2.1 4.3-4.6" fill="none" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export default function Programs() {
  const { id, sheet } = sheets.programs;
  return (
    <section className="sheet on-dark ps-section" id={id} data-sheet={sheet}>
      <ProgramsStory
        head={<SheetHead heading={programs.heading} body={programs.body} />}
        legend={
          <div className="sch-note mono">
            <span><i className="sw" />{programs.legend.core}</span>
            <span><i className="sw ext" />{programs.legend.ext}</span>
            <span>{programs.legend.every}</span>
          </div>
        }
      >
        <div className="schedule">
          <div className="sch-scale">
            <div className="lab mono">{programs.scaleLabel}</div>
            <div className="weeks">
              {Array.from({ length: programs.weeks }, (_, i) => <span key={i}>WK {i + 1}</span>)}
            </div>
          </div>

          {programs.items.map(program => (
            <ProgramRow
              key={program.id}
              id={program.id}
              head={
                <>
                  <div className="sch-name">
                    <span className="plus" aria-hidden="true">+</span>
                    <div>
                      <h3>{program.name}</h3>
                      <span className="mono">
                        {program.meta}
                        <span className="ps-cert" aria-hidden="true"><Seal />Certificate</span>
                      </span>
                    </div>
                  </div>
                  <div className="sch-track">
                    {program.bars.map(bar => (
                      <div
                        className={bar.ext ? "bar ext" : "bar"}
                        data-from={bar.from}
                        data-to={bar.to}
                        data-ext={bar.ext ? "" : undefined}
                        style={{ gridColumn: `${bar.from}/${bar.to}` }}
                        key={`${bar.from}-${bar.to}`}
                      >
                        {bar.label}
                      </div>
                    ))}
                  </div>
                </>
              }
            >
              <div className="detail-in">
                <div>
                  <p>{program.body}</p>
                  <div className="dl-row">
                    {program.links.map(link => (
                      <a className="dl" href={link.href} target="_blank" rel="noopener" key={link.href}>{link.label}</a>
                    ))}
                  </div>
                </div>
                <div>
                  {program.includes ? (
                    <>
                      <h4>{programs.includesHeading}</h4>
                      <ul className="incl">
                        {program.includes.map(item => <li key={item}>{item}</li>)}
                      </ul>
                    </>
                  ) : (
                    <>
                      <h4>{programs.weeksHeading}</h4>
                      <ol className="wk">
                        {program.weeks.map((week, w) => (
                          <li key={week}>
                            <b>WK {w + 1}</b>
                            {week}
                          </li>
                        ))}
                      </ol>
                    </>
                  )}
                </div>
              </div>
            </ProgramRow>
          ))}
        </div>
      </ProgramsStory>
    </section>
  );
}
