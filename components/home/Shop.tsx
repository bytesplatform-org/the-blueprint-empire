import type { CSSProperties } from "react";
import Image from "next/image";
import { insider, products, sheets } from "@/lib/content/site";
import { MaskLines } from "@/components/site/SheetHead";
import SubscribeForm from "./SubscribeForm";

/**
 * Below the contact sheet, on the same ivory: the Empire Insider List signup
 * on a dark panel, then the featured products (each opens in the live shop).
 */
export default function Shop() {
  const { id, sheet } = sheets.shop;
  return (
    <section className="sheet vellum shop" id={id} data-sheet={sheet}>
      <div className="wrap">
        <div className="insider" data-reveal="settle">
          <div>
            <h2>{insider.heading}</h2>
            <p>{insider.body}</p>
          </div>
          <SubscribeForm />
        </div>

        <h2 className="products-head" data-reveal="mask">
          <MaskLines lines={[products.heading]} />
        </h2>
        <div className="products">
          {products.items.map((item, i) => (
            <a
              className="product"
              href={item.href}
              target="_blank"
              rel="noopener"
              key={item.href}
              data-reveal="settle"
              style={i ? ({ "--i": i } as CSSProperties) : undefined}
            >
              <span className="product-img">
                <Image src={item.image.src} alt={item.image.alt} fill sizes="(max-width: 640px) 92vw, (max-width: 1000px) 46vw, 360px" />
                {item.ribbon && <span className="ribbon mono">{item.ribbon}</span>}
              </span>
              <h3>{item.name}</h3>
              <p className="price">
                {item.was && <s>{item.was}</s>}
                <b>{item.price}</b>
              </p>
            </a>
          ))}
          <a className="product product-all" href={products.all.href} target="_blank" rel="noopener" data-reveal="settle" style={{ "--i": products.items.length } as CSSProperties}>
            <span>{products.all.label}</span>
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
