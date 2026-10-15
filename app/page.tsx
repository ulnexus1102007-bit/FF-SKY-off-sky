"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronDown, Menu, Play, Plus, QrCode, ShoppingBag, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Product = { id: string; name: string; category: string; price: number; old_price: number | null; tone: string; image: string; image_url?: string; video_url?: string | null; tag: string; colors: string[] };
type StoreSettings = { whatsapp: string; nequi_name: string; nequi_account: string; nu_name: string; nu_account: string; instagram: string; tiktok: string; facebook: string };
const seedProducts: Product[] = [
  { id: "01", name: "Hoodie Fuera de órbita", category: "HOODIES", price: 189000, old_price: 219000, tone: "stone", image: "photo-1556821840-3a63f95609a7", tag: "DROP 01", colors: ["#161616", "#bdb7b1", "#8f171d"] },
  { id: "02", name: "Camiseta Sin señal", category: "CAMISETAS", price: 89000, old_price: null, tone: "tee", image: "photo-1521572163474-6864f9cf17ab", tag: "MÁS VENDIDO", colors: ["#111111", "#f2f0eb", "#8f171d"] },
  { id: "03", name: "Crewneck Órbita", category: "SUDADERAS", price: 159000, old_price: null, tone: "red", image: "photo-1578681994506-b8f463449011", tag: "NUEVO", colors: ["#8f171d", "#151515"] },
  { id: "04", name: "Gorra Modo avión", category: "ACCESORIOS", price: 69000, old_price: null, tone: "cap", image: "photo-1588850561407-ed78c282e89b", tag: "EDICIÓN LIMITADA", colors: ["#111111", "#f4f0e9"] },
];
const photo = (id: string, w = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;
const money = (n: number) => `$${n.toLocaleString("es-CO")}`;
const whatsappLink = (number: string) => number.replace(/\D/g, "");

export default function Home() {
  const [bagItems, setBagItems] = useState<Product[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const cart = bagItems.length;
  const [products, setProducts] = useState<Product[]>(seedProducts);
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("TODOS");
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({ whatsapp: "+57 315 050 3171", nequi_name: "", nequi_account: "", nu_name: "", nu_account: "", instagram: "", tiktok: "", facebook: "" });
  const [active, setActive] = useState<Product | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [notice, setNotice] = useState(false);
  const [qrUrl, setQrUrl] = useState("https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=https%3A%2F%2Foff-sky.vercel.app");

  useEffect(() => {
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=12&data=${encodeURIComponent(window.location.origin)}`);
    if (!supabase) return;
    supabase.from("products").select("id,name,category,price,old_price,image_url,video_url,tag,colors").eq("active", true).order("created_at").then(({ data, error }) => {
      if (!error && data?.length) setProducts(data.map((p) => ({ ...p, tone: "catalog", image: p.image_url, tag: p.tag || "OFF-SKY" })));
    });
    supabase.from("categories").select("name,slug").eq("active", true).order("sort_order").then(({ data }) => { if (data?.length) setCategories(data); });
    supabase.from("store_settings").select("value").eq("id", "storefront").maybeSingle().then(({ data }) => { if (data?.value) setStoreSettings((settings) => ({ ...settings, ...data.value })); });
  }, []);

  function addToBag() { if (!active) return; setBagItems((items) => [...items, active]); setNotice(true); window.setTimeout(() => setNotice(false), 2200); }

  return <main>
    <div className="announce"><span>ENVÍOS A TODA COLOMBIA</span><span>HECHO PARA QUIENES VAN POR FUERA</span><span>ENVÍO GRATIS DESDE $250.000</span></div>
    <header className="header">
      <button className="icon-button mobile-menu" aria-label="Abrir menú" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
      <nav className={menuOpen ? "nav open" : "nav"}><a href="#shop" onClick={() => setMenuOpen(false)}>SHOP</a><a href="#shop" onClick={() => setMenuOpen(false)}>NUEVO DROP</a><a href="#story" onClick={() => setMenuOpen(false)}>NOSOTROS</a><a href="#footer" onClick={() => setMenuOpen(false)}>CONTACTO</a></nav>
      <a href="#top" className="wordmark" id="top">OFF<span>—</span>SKY</a>
      <div className="header-actions"><button className="qr-link" onClick={() => setQrOpen(true)}><QrCode size={15}/> QR</button><button className="bag" aria-label="Ver bolsa" onClick={() => setCartOpen(true)}><ShoppingBag size={18}/><span>BOLSA ({cart})</span></button></div>
    </header>

    <section className="hero">
      <div className="hero-image" />
      <div className="hero-shade" />
      <div className="hero-topline"><span>BOGOTÁ, COLOMBIA · 2026</span><span>COLECCIÓN 001 / SIN SEÑAL</span></div>
      <div className="hero-copy"><p className="eyebrow">NO HAY SEÑAL. MEJOR.</p><h1>VISTE<br/><em>FUERA</em><br/>DE ÓRBITA.</h1><p className="hero-sub">Una nueva frecuencia para los que nunca encajaron en el molde.</p><a className="button button-light" href="#shop">DESCUBRE EL DROP <ArrowRight size={16}/></a></div>
      <div className="hero-bottom"><span>01 — 04 / PRENDAS PARA OTRO PLANETA</span><a href="#shop">DESLIZA PARA EXPLORAR <ArrowDown size={14}/></a><span>LAT. 4.7110° N</span></div>
      <div className="hero-index">OS / 001</div>
    </section>

    <div className="ticker"><div>{Array.from({length: 4}, (_, i) => <span key={i}>NO SIGAS LA SEÑAL <b>✳</b> OFF-SKY, FUERA DE ÓRBITA <b>✳</b> HECHO EN COLOMBIA <b>✳</b></span>)}</div></div>

    <section className="collection section" id="shop">
      <div className="section-heading"><div><p className="eyebrow dark">DROP 001 · SIN SEÑAL</p><h2>PIEZAS PARA <em>DESAPARECER.</em></h2></div><a className="text-link" href="#shop">VER TODO <ArrowUpRight size={16}/></a></div>
      <div className="catalog-filters"><button className={selectedCategory === "TODOS" ? "active" : ""} onClick={() => setSelectedCategory("TODOS")}>TODOS</button>{(categories.length ? categories : [...new Set(products.map((p) => p.category))].map((name) => ({ name, slug: name.toLowerCase() }))).map((c) => <button className={selectedCategory === c.name ? "active" : ""} key={c.slug} onClick={() => setSelectedCategory(c.name)}>{c.name.toUpperCase()}</button>)}</div>
      <div className="product-grid">{products.filter((p) => selectedCategory === "TODOS" || p.category === selectedCategory).map((p) => <article className="product-card" key={p.id} onClick={() => setActive(p)}>
        <button className={`product-image ${p.tone}`} aria-label={`Ver ${p.name}`}><img src={p.image_url || photo(p.image, 750)} alt={p.name}/>{p.video_url && <span className="card-video"><Play size={11} fill="currentColor"/> VIDEO</span>}<span className="product-tag">{p.tag}</span><span className="quick-add"><Plus size={16}/></span></button>
        <div className="product-meta"><div><p className="product-category">{p.category} · {p.id}</p><h3>{p.name}</h3></div><div className="prices">{p.old_price && <s>{money(p.old_price)}</s>}<b>{money(p.price)}</b></div></div>
        <div className="swatches">{p.colors.map((c) => <i key={c} style={{ background: c }}/>)}</div>
      </article>)}</div>
    </section>

    <section className="film" id="story"><div className="film-image"/><div className="film-overlay"/><div className="film-content"><p className="eyebrow">OFF-SKY FILM / 001</p><h2>NO ES PARA<br/>TODO EL <em>MUNDO.</em></h2><button className="play-button" aria-label="Reproducir video" onClick={() => setActive(products[0])}><Play fill="currentColor" size={18}/></button><p className="film-caption">VISTE TU PROPIA FRECUENCIA <span>01:24</span></p></div></section>

    <section className="manifesto"><p className="eyebrow dark">UNIFORME PARA LOS QUE NO TIENEN UNO</p><h2>EL MUNDO VA EN UNA DIRECCIÓN.<br/><em>NOSOTROS, EN OTRA.</em></h2><p>OFF-SKY nace en Colombia para romper el ruido. Diseñamos prendas honestas, cómodas y sin permiso. Menos reglas. Más espacio para ser.</p><a href="#footer" className="text-link">CONOCE NUESTRA HISTORIA <ArrowRight size={15}/></a></section>

    <section className="video-feature"><div className="video-frame"><img src={photo("photo-1529139574466-a303027c1d8b", 1500)} alt="Campaña de moda OFF-SKY"/><button className="video-play" onClick={() => setActive(products[1])}><Play fill="currentColor"/></button><span className="video-label">OFF-SKY / EN MOVIMIENTO</span></div><div className="video-note"><p className="eyebrow dark">LA PRENDA, EN SU ELEMENTO</p><h2>HECHA PARA<br/><em>MOVERTE.</em></h2><p>Texturas que se sienten. Siluetas que hablan. Mira cada pieza en movimiento antes de hacerla tuya.</p><a href="#shop" className="text-link">ENCUENTRA TU PIEZA <ArrowRight size={15}/></a></div></section>

    <section className="details-strip"><div><span>01</span><p><b>DISEÑO LOCAL</b><small>Creado en Colombia</small></p></div><div><span>02</span><p><b>ENVÍOS NACIONALES</b><small>Gratis desde $250.000</small></p></div><div><span>03</span><p><b>PAGO FÁCIL</b><small>Nequi · Banco Nu</small></p></div><div><span>04</span><p><b>¿UNA DUDA?</b><small>Te respondemos por WhatsApp</small></p></div></section>

    <footer id="footer"><div className="footer-main"><div className="footer-brand"><a className="wordmark" href="#top">OFF<span>—</span>SKY</a><p>NO SIGAS LA SEÑAL.<br/>ENCUENTRA LA TUYA.</p><div className="social-links">{storeSettings.instagram && <a href={storeSettings.instagram} target="_blank" rel="noreferrer">INSTAGRAM ↗</a>}{storeSettings.tiktok && <a href={storeSettings.tiktok} target="_blank" rel="noreferrer">TIKTOK ↗</a>}{storeSettings.facebook && <a href={storeSettings.facebook} target="_blank" rel="noreferrer">FACEBOOK ↗</a>}</div></div><div className="footer-column"><b>EXPLORA</b><a href="#shop">Shop</a><a href="#shop">Nuevo drop</a><a href="#story">Nuestra historia</a></div><div className="footer-column"><b>HABLEMOS</b><a href={`https://wa.me/${whatsappLink(storeSettings.whatsapp)}`} target="_blank" rel="noreferrer">WhatsApp {storeSettings.whatsapp}</a><a href="mailto:hola@off-sky.com">hola@off-sky.com</a></div><div className="footer-payment"><b>PAGA A TU MANERA</b><div><span>nequi</span><span>Banco Nu</span></div>{(storeSettings.nequi_account || storeSettings.nu_account) && <small>{storeSettings.nequi_account && <>Nequi: {storeSettings.nequi_name} · {storeSettings.nequi_account}<br/></>}{storeSettings.nu_account && <>Banco Nu: {storeSettings.nu_name} · {storeSettings.nu_account}</>}</small>}<small>Confirma tu pago por WhatsApp.</small></div></div><div className="footer-bottom"><span>© 2026 OFF-SKY · HECHO EN COLOMBIA</span><button onClick={() => setQrOpen(true)}><QrCode size={14}/> ESCANEA Y VISÍTANOS</button><span>BOGOTÁ, COLOMBIA</span></div></footer>

    <a className="whatsapp" href={`https://wa.me/${whatsappLink(storeSettings.whatsapp)}?text=Hola%20OFF-SKY%2C%20quiero%20saber%20m%C3%A1s%20de%20sus%20productos`} target="_blank" rel="noreferrer" aria-label="Escribir por WhatsApp"><span>ESCRÍBENOS</span><b>WA</b></a>
    {notice && <div className="toast"><Check size={16}/> Producto agregado a tu bolsa <span>({cart})</span></div>}
    {cartOpen && <div className="modal-backdrop" onClick={() => setCartOpen(false)}><div className="cart-modal" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setCartOpen(false)}><X/></button><p className="eyebrow dark">OFF-SKY / TU PEDIDO</p><h2>TU BOLSA <em>({cart})</em></h2>{bagItems.length ? <><div className="cart-lines">{bagItems.map((item, index) => <div key={`${item.id}-${index}`}><img src={item.image_url || photo(item.image, 200)} alt=""/><span>{item.name}<small>{item.category}</small></span><b>{money(item.price)}</b></div>)}</div><div className="cart-total"><span>TOTAL</span><b>{money(bagItems.reduce((sum, item) => sum + item.price, 0))}</b></div><div className="cart-pay-info">PAGA CON NEQUI O BANCO NU{storeSettings.nequi_account && <small>Nequi · {storeSettings.nequi_name}: {storeSettings.nequi_account}</small>}{storeSettings.nu_account && <small>Banco Nu · {storeSettings.nu_name}: {storeSettings.nu_account}</small>}</div><a className="button button-dark add-button" href={`https://wa.me/${whatsappLink(storeSettings.whatsapp)}?text=${encodeURIComponent(`Hola OFF-SKY, quiero comprar:\n${bagItems.map((item) => `• ${item.name} — ${money(item.price)}`).join("\n")}\nTotal: ${money(bagItems.reduce((sum, item) => sum + item.price, 0))}\nQuiero pagar por Nequi o Banco Nu.`)}`} target="_blank" rel="noreferrer">FINALIZAR POR WHATSAPP <ArrowUpRight size={15}/></a><p className="cart-footnote">Coordinamos talla, envío y pago seguro por WhatsApp.</p></> : <p className="cart-empty">Tu bolsa está vacía. Encuentra tu próxima pieza en el drop.</p>}</div></div>}
    {active && <div className="modal-backdrop" onClick={() => setActive(null)}><div className="product-modal" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setActive(null)}><X/></button><div className="modal-image">{active.video_url ? <video src={active.video_url} poster={active.image_url || photo(active.image, 900)} controls playsInline /> : <img src={active.image_url || photo(active.image, 900)} alt={active.name}/ >}{active.video_url && <span className="modal-video"><Play size={14} fill="currentColor"/> VIDEO DEL PRODUCTO</span>}</div><div className="modal-info"><p className="eyebrow dark">{active.category} · DROP 001</p><h2>{active.name}</h2><p className="modal-price">{money(active.price)} {active.old_price && <s>{money(active.old_price)}</s>}</p><p className="modal-copy">Diseño de edición limitada, confeccionado para acompañarte fuera de la rutina. Calce relajado y materiales seleccionados.</p><label>TALLA</label><div className="sizes">{["S", "M", "L", "XL"].map((s) => <button key={s}>{s}</button>)}</div><button className="button button-dark add-button" onClick={addToBag}>AGREGAR A LA BOLSA <Plus size={16}/></button><a className="modal-wa" href={`https://wa.me/${whatsappLink(storeSettings.whatsapp)}?text=${encodeURIComponent(`Hola OFF-SKY, quiero consultar por ${active.name}`)}`} target="_blank" rel="noreferrer">CONSULTAR POR WHATSAPP <ArrowUpRight size={14}/></a><div className="modal-payments">PAGA CON <b>nequi</b><b>Banco Nu</b><span>Coordinamos tu pago por WhatsApp.</span></div></div></div></div>}
    {qrOpen && <div className="modal-backdrop qr-backdrop" onClick={() => setQrOpen(false)}><div className="qr-modal" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setQrOpen(false)}><X/></button><p className="eyebrow dark">OFF-SKY / ESCANEA</p><h2>LA SEÑAL<br/><em>ESTÁ AQUÍ.</em></h2><img src={qrUrl} alt="Código QR para visitar OFF-SKY"/><p>Escanea para volver a la tienda.</p><a href="#top" onClick={() => setQrOpen(false)}>OFF-SKY.COM <ArrowUpRight size={14}/></a></div></div>}
  </main>;
}
