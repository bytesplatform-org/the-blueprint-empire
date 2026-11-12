import type { CSSProperties } from "react";
import { blog, sheets } from "@/lib/content/site";
import SheetHead from "@/components/site/SheetHead";
import ArcBg from "@/components/site/ArcBg";

/** The latest posts from the Blueprint Empire Blog; each opens on the live site. */
export default function Blog() {
  const { id, sheet } = sheets.blog;
  return (
    <section className="sheet vellum arc" id={id} data-sheet={sheet}>
      <ArcBg />
      <div className="wrap">
        <SheetHead heading={blog.heading} body={blog.body} />
        <div className="posts">
          {blog.posts.map((post, i) => (
            <a
              className="post"
              href={post.href}
              target="_blank"
              rel="noopener"
              key={post.href}
              data-reveal="settle"
              style={i ? ({ "--i": i } as CSSProperties) : undefined}
            >
              <span className="post-date mono">{post.date}</span>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <span className="post-more">
                {blog.more}
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
