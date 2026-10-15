"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, Box, Check, ChevronRight, CircleDollarSign, Eye, FolderOpen, Instagram, LayoutDashboard, LogOut, PackagePlus, Save, Settings, ShieldCheck, Trash2, Upload, Video } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import "./admin.css";

type Product = { id: string; name: string; category: string; price: number; old_price: number | null; image_url: string; gallery_urls: string[]; video_url: string | null; description: string; sizes: string[]; size_guide: string; tag: string; colors: string[]; active: boolean };
type Category = { id: string; name: string; slug: string; active: boolean; sort_order: number };
type StoreSettings = { whatsapp: string; nequi_name: string; nequi_account: string; nu_name: string; nu_account: string; instagram: string; tiktok: string; facebook: string };
const emptySettings: StoreSettings = { whatsapp: "+57 315 050 3171", nequi_name: "", nequi_account: "", nu_name: "", nu_account: "", instagram: "", tiktok: "", facebook: "" };
const blankProduct: Product = { id: "", name: "", category: "", price: 0, old_price: null, image_url: "", gallery_urls: [], video_url: null, description: "", sizes: ["S", "M", "L", "XL"], size_guide: "", tag: "NUEVO", colors: ["#111111"], active: true };
const toSlug = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function AdminPage() {
  const [sessionReady, setSessionReady] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authMode, setAuthMode] = useState<"signin" | "signup" | "forgot" | "update">("signin");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(emptySettings);
  const [editing, setEditing] = useState<Product | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabase) { setSessionReady(true); return; }
    supabase.auth.getSession().then(({ data }) => checkUser(data.session?.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") setAuthMode("update");
      void checkUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function checkUser(user: { email?: string; app_metadata?: Record<string, unknown> } | null) {
    setSessionReady(true);
    const isAdmin = user?.app_metadata?.role === "admin";
    setAuthorized(Boolean(isAdmin)); setUserEmail(isAdmin ? user?.email || "" : "");
    if (user && !isAdmin) setError("La cuenta inicio sesion, pero no tiene permisos de administrador. En Supabase asigna app_metadata.role = admin al usuario.");
    if (isAdmin) await loadData();
  }

  async function loadData() {
    if (!supabase) return;
    const [productResult, categoryResult, settingsResult] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("sort_order"),
      supabase.from("store_settings").select("value").eq("id", "storefront").maybeSingle(),
    ]);
    if (productResult.error) setError(`Productos: ${productResult.error.message}`); else setProducts(productResult.data || []);
    if (categoryResult.error) setError(`Categorías: ${categoryResult.error.message}`); else setCategories(categoryResult.data || []);
    if (settingsResult.data?.value) setSettings({ ...emptySettings, ...settingsResult.data.value });
  }

  async function signIn(e: FormEvent) {
    e.preventDefault(); setError("");
    if (!supabase) return setError("Configura las variables de Supabase para activar el administrador.");
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) setError(authError.message === "Invalid login credentials" ? "Correo o contrasena incorrectos. Verifica que el usuario exista en Supabase y que su correo este confirmado." : authError.message);
  }

  async function signUp(e: FormEvent) {
    e.preventDefault(); setError(""); setMessage("");
    if (!supabase) return setError("Configura las variables de Supabase para crear una cuenta.");
    if (password.length < 8) return setError("Usa una contrasena de al menos 8 caracteres.");
    setBusy(true);
    const { error: signUpError } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/admin` } });
    if (signUpError) setError(signUpError.message);
    else { setMessage("Cuenta creada. Revisa tu correo para confirmar. Para entrar al admin, asigna el rol admin a este usuario en Supabase."); setAuthMode("signin"); setPassword(""); }
    setBusy(false);
  }

  async function sendPasswordReset(e: FormEvent) {
    e.preventDefault(); setError(""); setMessage("");
    if (!supabase) return setError("Supabase no esta configurado.");
    setBusy(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/admin` });
    if (resetError) setError(resetError.message); else setMessage("Si el correo esta registrado, recibiras un enlace para cambiar la contrasena.");
    setBusy(false);
  }

  async function updatePassword(e: FormEvent) {
    e.preventDefault(); setError(""); setMessage("");
    if (!supabase) return setError("Supabase no esta configurado.");
    if (newPassword.length < 8) return setError("La nueva contrasena debe tener al menos 8 caracteres.");
    if (newPassword !== confirmPassword) return setError("Las contrasenas no coinciden.");
    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) setError(updateError.message);
    else { setMessage("Contrasena actualizada. Ya puedes iniciar sesion."); await supabase.auth.signOut(); setAuthMode("signin"); setPassword(""); setNewPassword(""); setConfirmPassword(""); }
    setBusy(false);
  }

  async function signOut() { await supabase?.auth.signOut(); setAuthorized(false); }
  function toast(text: string) { setMessage(text); window.setTimeout(() => setMessage(""), 2600); }

  async function uploadMedia(file: File, kind: "image" | "video") {
    if (!supabase) return;
    setBusy(true); setError("");
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${Date.now()}-${crypto.randomUUID()}-${safeName}`;
    const { error: uploadError } = await supabase.storage.from("product-media").upload(path, file, { upsert: false, contentType: file.type });
    if (uploadError) setError(uploadError.message);
    else {
      const { data } = supabase.storage.from("product-media").getPublicUrl(path);
      setEditing((p) => p ? kind === "image" ? (p.image_url ? { ...p, gallery_urls: [...p.gallery_urls, data.publicUrl] } : { ...p, image_url: data.publicUrl }) : { ...p, video_url: data.publicUrl } : p);
      toast(kind === "image" ? "Imagen cargada" : "Video cargado");
    }
    setBusy(false);
  }

  async function saveProduct(e: FormEvent) {
    e.preventDefault(); if (!supabase || !editing) return;
    if (!editing.name.trim() || !editing.category || !editing.image_url || editing.price < 0) return setError("Completa nombre, categoría, precio e imagen.");
    setBusy(true); setError("");
    const row = { ...editing, id: editing.id || crypto.randomUUID(), old_price: editing.old_price || null, video_url: editing.video_url || null, colors: editing.colors.filter(Boolean), sizes: editing.sizes.filter(Boolean) };
    const { error: saveError } = await supabase.from("products").upsert(row);
    if (saveError) setError(saveError.message); else { setEditing(null); await loadData(); toast("Producto guardado"); }
    setBusy(false);
  }

  async function deleteProduct(product: Product) {
    if (!supabase || !window.confirm(`¿Eliminar “${product.name}”?`)) return;
    const { error: deleteError } = await supabase.from("products").delete().eq("id", product.id);
    if (deleteError) setError(deleteError.message); else { setProducts((list) => list.filter((p) => p.id !== product.id)); toast("Producto eliminado"); }
  }

  async function addCategory(e: FormEvent) {
    e.preventDefault(); if (!supabase || !categoryName.trim()) return;
    const name = categoryName.trim();
    const { error: categoryError } = await supabase.from("categories").insert({ name, slug: toSlug(name), active: true, sort_order: categories.length });
    if (categoryError) setError(categoryError.message); else { setCategoryName(""); await loadData(); toast("Categoría creada"); }
  }

  async function toggleCategory(category: Category) {
    if (!supabase) return;
    const { error: categoryError } = await supabase.from("categories").update({ active: !category.active }).eq("id", category.id);
    if (categoryError) setError(categoryError.message); else await loadData();
  }

  async function saveSettings(e: FormEvent) {
    e.preventDefault(); if (!supabase) return;
    setBusy(true); setError("");
    const { error: saveError } = await supabase.from("store_settings").upsert({ id: "storefront", value: settings, updated_at: new Date().toISOString() });
    if (saveError) setError(saveError.message); else toast("Configuración guardada");
    setBusy(false);
  }

  if (!sessionReady) return <div className="admin-loading">OFF—SKY / CARGANDO ADMIN</div>;
  if (!authorized || authMode === "update") return <main className="admin-login"><Link href="/" className="admin-back"><ArrowLeft size={15}/> VOLVER A LA TIENDA</Link><div className="login-card"><span className="admin-logo">OFF<span>—</span>SKY</span><p className="admin-kicker">PANEL DE CONTROL</p><h1>{authMode === "update" ? <>CAMBIA TU<br/><em>CONTRASENA.</em></> : authMode === "forgot" ? <>RECUPERA TU<br/><em>ACCESO.</em></> : authMode === "signup" ? <>CREA TU<br/><em>CUENTA.</em></> : <>ENTRA AL<br/><em>BACKSTAGE.</em></>}</h1><p className="login-desc">{authMode === "signup" ? "Crea tu usuario. Un administrador debe habilitar el acceso al panel." : "Acceso exclusivo para el equipo OFF-SKY."}</p>{!supabase && <p className="admin-error">Supabase no esta configurado en este despliegue.</p>}{authMode === "update" ? <form onSubmit={updatePassword}><label>Nueva contrasena</label><input type="password" minLength={8} autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required/><label>Confirma la contrasena</label><input type="password" minLength={8} autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required/><button className="admin-primary" disabled={!supabase || busy}>GUARDAR CONTRASENA <ChevronRight size={16}/></button></form> : authMode === "forgot" ? <form onSubmit={sendPasswordReset}><label>Correo de tu cuenta</label><input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="admin@off-sky.com"/><button className="admin-primary" disabled={!supabase || busy}>ENVIAR ENLACE <ChevronRight size={16}/></button></form> : <form onSubmit={authMode === "signup" ? signUp : signIn}><label>Correo electronico</label><input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="admin@off-sky.com"/><label>Contrasena</label><input type="password" minLength={authMode === "signup" ? 8 : undefined} autoComplete={authMode === "signup" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Minimo 8 caracteres"/><button className="admin-primary" disabled={!supabase || busy}>{authMode === "signup" ? "CREAR CUENTA" : "INICIAR SESION"} <ChevronRight size={16}/></button></form>}{error && <p className="admin-error" role="alert">{error}</p>}{message && <p className="admin-auth-message" role="status">{message}</p>}<div className="auth-links">{authMode !== "signin" && <button type="button" onClick={() => { setAuthMode("signin"); setError(""); }}>Volver a iniciar sesion</button>}{authMode === "signin" && <><button type="button" onClick={() => { setAuthMode("forgot"); setError(""); setMessage(""); }}>Olvide mi contrasena</button><button type="button" onClick={() => { setAuthMode("signup"); setError(""); setMessage(""); }}>Crear usuario</button></>}</div><small>El acceso de administrador se asigna desde Supabase; el registro no concede permisos automaticamente.</small></div></main>;

  const nav = [{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard }, { id: "products", label: "Productos", icon: Box }, { id: "categories", label: "Categorías y filtros", icon: FolderOpen }, { id: "settings", label: "Tienda y pagos", icon: Settings }];
  return <main className="admin-shell"><aside className="admin-sidebar"><Link href="/" className="admin-logo">OFF<span>—</span>SKY</Link><p className="admin-kicker">STUDIO / ADMIN</p><nav>{nav.map((item) => <button key={item.id} className={tab === item.id ? "selected" : ""} onClick={() => { setTab(item.id); setEditing(null); }}><item.icon size={17}/>{item.label}</button>)}</nav><div className="sidebar-bottom"><span><i/> {userEmail}</span><button onClick={signOut}><LogOut size={15}/> Cerrar sesión</button><Link href="/" className="store-link"><Eye size={15}/> Ver tienda</Link></div></aside>
    <section className="admin-main"><header className="admin-top"><div><p className="admin-kicker">OFF-SKY / ADMINISTRACIÓN</p><h1>{nav.find((n) => n.id === tab)?.label}</h1></div><Link href="/" className="admin-preview"><Eye size={15}/> VER TIENDA</Link></header>
      {error && <div className="admin-alert">{error}<button onClick={() => setError("")}>×</button></div>}
      {tab === "dashboard" && <><div className="welcome-panel"><div><p className="admin-kicker">QUÉ BUENO VERTE, {userEmail.split("@")[0].toUpperCase()}</p><h2>Tu tienda.<br/><em>Tu frecuencia.</em></h2><p>Desde aquí controlas el catálogo y la información que ven tus clientes.</p></div><ShieldCheck size={48}/></div><div className="stat-grid"><article><span>PRODUCTOS ACTIVOS</span><b>{products.filter((p) => p.active).length.toString().padStart(2, "0")}</b><Box/></article><article><span>CATEGORÍAS</span><b>{categories.filter((c) => c.active).length.toString().padStart(2, "0")}</b><FolderOpen/></article><article><span>VIDEOS EN CATÁLOGO</span><b>{products.filter((p) => p.video_url).length.toString().padStart(2, "0")}</b><Video/></article><article><span>VALOR DEL CATÁLOGO</span><b>${products.reduce((sum, p) => sum + (p.active ? p.price : 0), 0).toLocaleString("es-CO")}</b><CircleDollarSign/></article></div><div className="admin-panel"><div className="panel-heading"><div><p className="admin-kicker">ACCESO RÁPIDO</p><h3>¿Qué quieres hacer?</h3></div></div><div className="quick-actions"><button onClick={() => { setTab("products"); setEditing({ ...blankProduct }); }}><PackagePlus/><b>Subir producto</b><span>Fotos, precio y video</span></button><button onClick={() => setTab("categories")}><FolderOpen/><b>Crear categoría</b><span>Organiza tu catálogo</span></button><button onClick={() => setTab("settings")}><Settings/><b>Editar datos de tienda</b><span>Pagos y redes sociales</span></button></div></div><div className="admin-panel"><div className="panel-heading"><div><p className="admin-kicker">ÚLTIMAS PIEZAS</p><h3>Catálogo reciente</h3></div><button className="admin-text-button" onClick={() => setTab("products")}>VER CATÁLOGO →</button></div><ProductRows products={products.slice(0, 4)} edit={(p) => { setEditing(p); setTab("products"); }} remove={deleteProduct}/></div></>}
      {tab === "products" && <div className="admin-panel"><div className="panel-heading"><div><p className="admin-kicker">INVENTARIO / DROP</p><h3>{editing ? (editing.id ? "Editar producto" : "Nuevo producto") : "Tu catálogo"}</h3></div>{!editing && <button className="admin-primary compact" onClick={() => { setError(""); setEditing({ ...blankProduct, category: categories[0]?.name || "" }); }}><PackagePlus size={16}/> SUBIR PRODUCTO</button>}</div>{editing ? <form className="product-form" onSubmit={saveProduct}><div className="form-grid"><label>Nombre<input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Ej. Camiseta Fuera de órbita" required/></label><label>Categoría<select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} required><option value="">Elige categoría</option>{categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}</select></label><label>Precio (COP)<input type="number" min="0" value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} required/></label><label>Precio anterior (opcional)<input type="number" min="0" value={editing.old_price || ""} onChange={(e) => setEditing({ ...editing, old_price: e.target.value ? Number(e.target.value) : null })}/></label><label>Etiqueta<input value={editing.tag} onChange={(e) => setEditing({ ...editing, tag: e.target.value })} placeholder="DROP 01 / NUEVO"/></label><label>Colores hex separados por coma<input value={editing.colors.join(", ")} onChange={(e) => setEditing({ ...editing, colors: e.target.value.split(",").map((v) => v.trim()) })} placeholder="#111111, #eeeeee"/></label><label>Tallas disponibles<input value={editing.sizes.join(", ")} onChange={(e) => setEditing({ ...editing, sizes: e.target.value.split(",").map((v) => v.trim()) })} placeholder="S, M, L, XL"/></label><label className="form-span">Descripción<textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} placeholder="Describe el ajuste, la tela y los detalles de la prenda"/></label><label className="form-span">Guía de tallas<textarea value={editing.size_guide} onChange={(e) => setEditing({ ...editing, size_guide: e.target.value })} rows={3} placeholder="Ej. S: pecho 52 cm, largo 68 cm. M: pecho 55 cm, largo 71 cm."/></label></div><div className="media-fields"><div className="media-field"><strong><Upload size={17}/> FOTOS DEL PRODUCTO *</strong>{editing.image_url && <img src={editing.image_url} alt="Vista previa"/>}{editing.gallery_urls.map((src, index) => <img key={src} src={src} alt={`Foto adicional ${index + 1}`}/ >)}<input type="file" accept="image/*" multiple onChange={(e) => e.target.files && Array.from(e.target.files).forEach((file) => void uploadMedia(file, "image"))}/><small>La primera foto será la principal. Puedes agregar varias vistas (JPG, PNG o WebP; máx. 100 MB cada una).</small></div><div className="media-field"><strong><Video size={17}/> VIDEO DEL PRODUCTO</strong>{editing.video_url && <video src={editing.video_url} controls/>}<input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={(e) => e.target.files?.[0] && void uploadMedia(e.target.files[0], "video")}/><small>MP4 o WebM. Opcional; máximo 100 MB.</small></div></div><label className="check-label"><input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })}/> Visible en la tienda</label><div className="form-actions"><button type="button" className="admin-secondary" onClick={() => setEditing(null)}>CANCELAR</button><button className="admin-primary" disabled={busy}><Save size={15}/> {busy ? "GUARDANDO…" : "GUARDAR PRODUCTO"}</button></div></form> : <ProductRows products={products} edit={setEditing} remove={deleteProduct}/>}</div>}
      {tab === "categories" && <div className="admin-panel"><div className="panel-heading"><div><p className="admin-kicker">ORGANIZACIÓN DEL CATÁLOGO</p><h3>Categorías y filtros</h3></div></div><p className="panel-description">Crea tus propios tipos de prenda, por ejemplo: Camisetas, Busos, Sacos o accesorios. Las categorías activas aparecen como filtros en la tienda.</p><form className="category-create" onSubmit={addCategory}><input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="Nombre de la categoría"/><button className="admin-primary"><PackagePlus size={15}/> CREAR FILTRO</button></form><div className="category-list">{categories.map((c) => <div key={c.id}><FolderOpen size={18}/><span><b>{c.name}</b><small>/{c.slug} · {products.filter((p) => p.category === c.name).length} productos</small></span><button className={c.active ? "status-active" : "status-inactive"} onClick={() => void toggleCategory(c)}>{c.active ? "ACTIVA" : "OCULTA"}</button></div>)}</div></div>}
      {tab === "settings" && <form className="admin-panel settings-form" onSubmit={saveSettings}><div className="panel-heading"><div><p className="admin-kicker">CANALES DE VENTA</p><h3>Información de tu tienda</h3></div></div><p className="panel-description">Estos datos se usan para que tus clientes puedan contactarte y coordinar el pago.</p><div className="settings-section"><h4>WhatsApp de ventas</h4><label>Número de WhatsApp (con indicativo)<input value={settings.whatsapp} onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })} placeholder="+57 315 050 3171"/></label></div><div className="settings-section"><h4>Cuentas para recibir pagos</h4><div className="form-grid"><label>Nombre en Nequi<input value={settings.nequi_name} onChange={(e) => setSettings({ ...settings, nequi_name: e.target.value })} placeholder="Nombre del titular"/></label><label>Número Nequi<input value={settings.nequi_account} onChange={(e) => setSettings({ ...settings, nequi_account: e.target.value })} placeholder="Número de cuenta"/></label><label>Nombre en Banco Nu<input value={settings.nu_name} onChange={(e) => setSettings({ ...settings, nu_name: e.target.value })} placeholder="Nombre del titular"/></label><label>Cuenta / llave de Banco Nu<input value={settings.nu_account} onChange={(e) => setSettings({ ...settings, nu_account: e.target.value })} placeholder="Número de cuenta o llave"/></label></div></div><div className="settings-section"><h4>Redes sociales</h4><div className="form-grid"><label><span><Instagram size={14}/> Instagram URL</span><input type="url" value={settings.instagram} onChange={(e) => setSettings({ ...settings, instagram: e.target.value })} placeholder="https://instagram.com/tu-marca"/></label><label>TikTok URL<input type="url" value={settings.tiktok} onChange={(e) => setSettings({ ...settings, tiktok: e.target.value })} placeholder="https://tiktok.com/@tu-marca"/></label><label>Facebook URL<input type="url" value={settings.facebook} onChange={(e) => setSettings({ ...settings, facebook: e.target.value })} placeholder="https://facebook.com/tu-marca"/></label></div></div><div className="form-actions"><button className="admin-primary" disabled={busy}><Save size={15}/> {busy ? "GUARDANDO…" : "GUARDAR CONFIGURACIÓN"}</button></div></form>}
      <footer className="admin-footer">OFF-SKY · PANEL PRIVADO <span>HECHO EN COLOMBIA</span></footer>
    </section>{message && <div className="admin-toast"><Check size={16}/>{message}</div>}</main>;
}

function ProductRows({ products, edit, remove }: { products: Product[]; edit: (p: Product) => void; remove: (p: Product) => void }) {
  if (!products.length) return <div className="empty-catalog">Aún no hay productos. Sube la primera pieza de tu catálogo.</div>;
  return <div className="product-rows">{products.map((p) => <article key={p.id}><img src={p.image_url} alt=""/><div className="product-row-info"><span>{p.category} · {p.tag}</span><b>{p.name}</b><small>${p.price.toLocaleString("es-CO")} COP · {p.active ? "Visible" : "Oculto"}{p.video_url ? " · Tiene video" : ""}</small></div>{p.video_url && <Video className="row-video" size={16}/>}<button onClick={() => edit(p)}>EDITAR</button><button className="delete-button" aria-label={`Eliminar ${p.name}`} onClick={() => remove(p)}><Trash2 size={16}/></button></article>)}</div>;
}
