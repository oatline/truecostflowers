const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
// Assets (photos, styles, catalogue) live on the main deploy; on that host paths stay relative.
const ASSET=/truecostflowers\.netlify\.app$/.test(location.hostname)?"":"https://truecostflowers.netlify.app/";
const WA="79267318640", TG="https://t.me/truecostflowers";
let products=[],filter="Все",query="",cart=[],favs=[];
try{cart=JSON.parse(localStorage.getItem("tcf-cart")||"[]");favs=JSON.parse(localStorage.getItem("tcf-favs")||"[]")}catch(e){}
const money=n=>new Intl.NumberFormat("ru-RU").format(n)+" ₽";
const arrowIcon='<span class="arrow-mark"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 12h15.5M13.5 6l6 6-6 6"/></svg></span>';
const heartIcon='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20.8 8.7c0 5.2-8.8 11-8.8 11s-8.8-5.8-8.8-11a4.7 4.7 0 0 1 8.8-2.2 4.7 4.7 0 0 1 8.8 2.2Z"/></svg>';
const save=()=>{try{localStorage.setItem("tcf-cart",JSON.stringify(cart));localStorage.setItem("tcf-favs",JSON.stringify(favs))}catch(e){}updateCounts()};
const asm=p=>typeof p.assembly==="number"?money(p.assembly):(p.assembly||"по запросу");
function updateCounts(){$("#cartCount").textContent=cart.reduce((s,x)=>s+x.qty,0);$("#favCount").textContent=favs.length}
function toast(t){let e=$("#toast");e.textContent=t;e.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove("show"),2600)}
function priceLine(p){return p.price?money(p.price):"Стоимость уточняйте у менеджера"}
function render(){
 let arr=products.filter(p=>(filter==="Все"||p.category===filter)&&(p.title.toLowerCase().includes(query)||p.id.toLowerCase().includes(query)));
 let sort=$("#sortSelect").value;if(sort==="low")arr.sort((a,b)=>(a.price||1e12)-(b.price||1e12));if(sort==="high")arr.sort((a,b)=>(b.price||0)-(a.price||0));
 $("#resultCount").textContent=`${arr.length} композиций`;
 $("#productGrid").innerHTML=arr.map(p=>`<article class="product-card"><div class="product-photo" data-open="${p.id}"><img loading="lazy" src="${p.image}" alt="${p.title}"></div><button class="heart ${favs.includes(p.id)?"selected":""}" data-fav="${p.id}" aria-label="${favs.includes(p.id)?"Убрать из избранного":"Добавить в избранное"}" aria-pressed="${favs.includes(p.id)}">${heartIcon}</button><div class="product-info"><div class="product-meta">${p.size}</div><h3 class="product-title" data-open="${p.id}">${p.title}</h3><div class="product-bottom"><div class="product-price">${priceLine(p)}<small>${p.price?`Сборка: ${asm(p)}`:"Цена и сборка по запросу"}</small></div><button class="add-btn" data-add="${p.id}" aria-label="${p.inquiry?"Уточнить цену":"Добавить в корзину"}">+</button></div></div></article>`).join("")||'<div class="empty">Ничего не найдено. Попробуйте изменить фильтр.</div>';
 observeReveal();
}
function product(id){return products.find(p=>p.id===id)}
function add(id){let p=product(id);if(!p)return;if(p.inquiry){openProduct(id);return}let item=cart.find(x=>x.id===id);item?item.qty++:cart.push({id,qty:1});save();toast("Добавлено в корзину")}
function toggleFav(id){favs=favs.includes(id)?favs.filter(x=>x!==id):[...favs,id];save();render()}
function openProduct(id){let p=product(id);$("#modalContent").innerHTML=`<div class="modal-product"><img src="${p.image}" alt="${p.title}"><div><div class="section-kicker">${p.category} · ${p.size}</div><h2>${p.title}</h2><p>Авторская цветочная композиция TRUECOSTFLOWERS. Финальный состав и наличие подтвердит менеджер.</p><div class="modal-price">${priceLine(p)}<small>${p.price?`Сборка отдельно: ${asm(p)}`:"Стоимость композиции и сборки уточняйте у менеджера"}</small></div><div class="modal-actions"><button class="solid-btn" data-add="${p.id}"><span>${p.inquiry?"Уточнить у менеджера":"Добавить в корзину"} ${arrowIcon}</span></button><button class="outline-btn modal-fav" data-fav="${p.id}">${heartIcon} В избранное</button></div></div></div>`;$("#productModal").classList.add("open");$("#overlay").classList.add("show")}
function showDrawer(id){$("#cartDrawer").classList.remove("open");$("#favDrawer").classList.remove("open");$(id).classList.add("open");$("#overlay").classList.add("show");if(id==="#cartDrawer")renderCart();else renderFavs()}
function closeAll(){$$(".drawer,.modal").forEach(e=>e.classList.remove("open"));$("#overlay").classList.remove("show")}
function cartTotal(){return cart.reduce((s,x)=>{let p=product(x.id);return s+(p?.price||0)*x.qty+(typeof p?.assembly==="number"?p.assembly*x.qty:0)},0)}
function renderCart(){let rows=cart.map(x=>{let p=product(x.id);return p?`<div class="cart-row"><img src="${p.image}" alt=""><div><h3>${p.title}</h3><small>${money(p.price)} · сборка ${asm(p)}</small><div class="qty"><button data-qty="${p.id}" data-delta="-1" aria-label="Меньше">−</button>${x.qty}<button data-qty="${p.id}" data-delta="1" aria-label="Больше">+</button></div></div><button class="remove" data-remove="${p.id}" aria-label="Удалить">×</button></div>`:""}).join("");
$("#cartItems").innerHTML=rows||'<div class="empty">Корзина пока пуста.</div>';
$("#cartTotal").innerHTML=`<span>Букеты и сборка<small>доставку подтвердит менеджер</small></span><b>${money(cartTotal())}</b>`;
$("#checkoutStart").disabled=!cart.length}
function renderFavs(){$("#favItems").innerHTML=favs.map(id=>{let p=product(id);return p?`<div class="cart-row"><img src="${p.image}" alt=""><div><h3>${p.title}</h3><small>${priceLine(p)}</small><div class="qty"><button data-open="${id}">Подробнее</button></div></div><button class="remove" data-fav="${id}" aria-label="Убрать">×</button></div>`:""}).join("")||'<div class="empty">В избранном пока пусто.</div>'}
document.addEventListener("click",e=>{let t=e.target.closest("[data-open],[data-add],[data-fav],[data-qty],[data-remove],[data-close]");if(!t)return;
if(t.dataset.open)openProduct(t.dataset.open);
if(t.dataset.add){let p=product(t.dataset.add);if(p?.inquiry){closeAll();window.open(`https://wa.me/${WA}?text=`+encodeURIComponent("Здравствуйте! Хочу уточнить стоимость: "+p.title),"_blank")}else add(t.dataset.add)}
if(t.dataset.fav){toggleFav(t.dataset.fav);if($("#favDrawer").classList.contains("open"))renderFavs()}
if(t.dataset.qty){let x=cart.find(x=>x.id===t.dataset.qty);if(x){x.qty+=Number(t.dataset.delta);if(x.qty<1)cart=cart.filter(y=>y!==x);save();renderCart()}}
if(t.dataset.remove){cart=cart.filter(x=>x.id!==t.dataset.remove);save();renderCart()}
if(t.hasAttribute("data-close"))closeAll();
});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeAll()});
$("#filters").addEventListener("click",e=>{let b=e.target.closest("[data-filter]");if(!b)return;filter=b.dataset.filter;$$(".filter").forEach(x=>x.classList.toggle("active",x===b));render()});
$$("[data-jump]").forEach(a=>a.addEventListener("click",()=>{filter=a.dataset.jump;$$(".filter").forEach(x=>x.classList.toggle("active",x.dataset.filter===filter));render()}));
$("#sortSelect").addEventListener("change",render);
$("#cartToggle").onclick=()=>showDrawer("#cartDrawer");$("#favToggle").onclick=()=>showDrawer("#favDrawer");$("#overlay").onclick=closeAll;
$("#searchToggle").onclick=()=>$("#searchbar").classList.toggle("open");$("#searchClose").onclick=()=>$("#searchbar").classList.remove("open");
$("#searchInput").addEventListener("input",e=>{query=e.target.value.toLowerCase();filter="Все";$$(".filter").forEach(x=>x.classList.toggle("active",x.dataset.filter==="Все"));render()});
$("#menuToggle").onclick=()=>document.querySelector(".header nav").classList.toggle("open");
$$(".header nav a").forEach(a=>a.addEventListener("click",()=>document.querySelector(".header nav").classList.remove("open")));
$("#checkoutStart").onclick=()=>{if(!cart.length){toast("Сначала добавьте букет в корзину");return}$("#checkoutModal").classList.add("open");$("#cartDrawer").classList.remove("open")};
// Pickup needs no address.
const syncMethod=()=>{let pickup=$("#methodSelect").value==="Самовывоз";$("#addressField").hidden=pickup;$("#addressInput").required=!pickup};
$("#methodSelect").addEventListener("change",syncMethod);syncMethod();
function orderText(f){
 let items=cart.map(x=>{let p=product(x.id);return `• ${p.title} × ${x.qty} — ${priceLine(p)}, сборка ${asm(p)}`}).join("\n");
 let L=[`Здравствуйте! Хочу оформить заказ:`,items,`Итого букеты и сборка: ${money(cartTotal())}`,``,`Получение: ${f.get("method")}`];
 if(f.get("method")!=="Самовывоз")L.push(`Адрес: ${f.get("address")}`);
 L.push(`Дата: ${f.get("date")||"уточнить"}, время: ${f.get("time")||"уточнить"}`,`Заказчик: ${f.get("name")}, ${f.get("phone")}`);
 if(f.get("recipient")||f.get("recipientPhone"))L.push(`Получатель: ${[f.get("recipient"),f.get("recipientPhone")].filter(Boolean).join(", ")}`);
 if(f.get("card"))L.push(`Текст открытки: ${f.get("card")}`);
 if(f.get("comment"))L.push(`Комментарий: ${f.get("comment")}`);
 L.push(``,`Прошу подтвердить наличие и итоговую стоимость.`);
 return L.join("\n");
}
$("#checkoutForm").addEventListener("submit",async e=>{e.preventDefault();
 let f=new FormData(e.target),text=orderText(f),via=e.submitter?.value||"tg";
 if(via==="wa"){window.open(`https://wa.me/${WA}?text=`+encodeURIComponent(text),"_blank");toast("Открываем WhatsApp для подтверждения заказа");return}
 let copied=false;try{await navigator.clipboard.writeText(text);copied=true}catch(err){}
 window.open(TG,"_blank");
 toast(copied?"Текст заказа скопирован — вставьте его в чат Telegram":"Откройте чат и опишите заказ — менеджер ответит");
});
products=(window.TCF_PRODUCTS||[]).map(p=>({...p,image:/^https?:/.test(p.image)?p.image:ASSET+p.image}));

// Gentle scroll reveals for editorial sections and catalogue cards.
const revealObserver="IntersectionObserver" in window?new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("is-visible");revealObserver.unobserve(entry.target)}}),{threshold:.08}):null;
function observeReveal(){document.querySelectorAll(".section-wrap,.category-strip a,.price-tile,.product-card"+(matchMedia("(max-width:900px)").matches?",.seasonal-note":"")).forEach(el=>{if(el.classList.contains("reveal"))return;el.classList.add("reveal");revealObserver?revealObserver.observe(el):el.classList.add("is-visible")})}
if(products.length){render();updateCounts()}else{$("#productGrid").innerHTML='<div class="empty">Каталог не загрузился. Обновите страницу.</div>';}
observeReveal();

// Cookie preferences: essential site storage is always on; optional categories require opt-in.
(()=>{
 const KEY='tcf_cookie_preferences_v1';
 const banner=document.getElementById('cookieBanner');
 const modal=document.getElementById('cookieModal');
 if(!banner||!modal)return;
 const analytics=document.getElementById('cookieAnalytics');
 const marketing=document.getElementById('cookieMarketing');
 let saved=null; try{saved=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){}
 const showBanner=()=>{banner.hidden=false};
 const hideBanner=()=>{banner.hidden=true};
 const save=(a,m)=>{const value={essential:true,analytics:!!a,marketing:!!m,updatedAt:new Date().toISOString()};try{localStorage.setItem(KEY,JSON.stringify(value))}catch(e){}saved=value;hideBanner();modal.hidden=true;};
 const openSettings=()=>{analytics.checked=!!saved?.analytics;marketing.checked=!!saved?.marketing;modal.hidden=false;};
 if(!saved)showBanner();
 document.getElementById('cookieAccept')?.addEventListener('click',()=>save(true,true));
 document.getElementById('cookieReject')?.addEventListener('click',()=>save(false,false));
 document.getElementById('cookieCustomize')?.addEventListener('click',openSettings);
 document.getElementById('cookieSettingsLink')?.addEventListener('click',openSettings);
 document.getElementById('cookieSave')?.addEventListener('click',()=>save(analytics.checked,marketing.checked));
 document.getElementById('cookieModalClose')?.addEventListener('click',()=>{modal.hidden=true;if(!saved)showBanner()});
 document.getElementById('cookieInfoLink')?.addEventListener('click',e=>{e.preventDefault();openSettings()});
 modal.addEventListener('click',e=>{if(e.target===modal){modal.hidden=true;if(!saved)showBanner()}});
})();
