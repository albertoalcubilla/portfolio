// Descarga los vídeos completos y las galerías de las páginas de proyecto del antiguo Canva.
// Uso: node tools/fetch-canva.mjs   (desde la raíz del proyecto). Los originales quedan fuera de git.
import { mkdirSync, writeFileSync, existsSync, statSync } from 'node:fs';

const BASE = 'https://alberto-alcubilla.my.canva.site/_assets/';

const films = {
  desertoris: '86f9a8724a2cf135d4231a463e584ed2',
  paranoia: 'b1d1a47be8836678a1cba2492406dd35',
  'ver-la-luz': '4be7b5a91f0b17dab4faaa02252b6910',
  dimension: 'a6b75c374e0382ecdba595d347431e81',
  'volver-a-caer': '7e11785cfac6da400bd395cbb3d9a919',
  emperatriz: 'b1d6518cd5d6efa1bbd505032e81a7ad',
  'hot-girl-summer': '827f691cf9b33e3897e2afec0a5d351a',
  habitada: 'b7fade18afb56b23cbf1c69e2da23f80',
  'cuando-nadie-me-ve': '7fdd364a5a42143e9267ea705f719eaf',
};

const galleries = {
  desertoris: ['2cc449466c94786af4d7684f07363fc9.jpg', 'd5320eed536fcea46ee973e404b9ffc6.jpg', 'c7d99e79590b4a7905b708c828e27b8d.jpg', '5b11b095518e9850df0df7377e82e3c7.jpg', '6a611d08f38e21956f5f5c8ee03d2a23.jpg', '7ab150dc578b6c9bf6a70c60efc82bdb.jpg', 'a91ff05d17856150284068553389bf40.jpg', 'd2a9ff81925460cb2090a47d22cccd3a.jpg'],
  paranoia: ['f2150d91317d118ed0b7d4be80a8dc7c.png', '9caec42f3a756083562c2bf072187bb6.png', 'a3cf605f0eb10c9621ee220341701565.png', '018c71746c7c27a5376da418d068a992.png'],
  'sombras-del-futuro': ['fb1e5f484be151f5fefd936b367a4509.png', '31f34e71161fbd3fb87521608a45913c.png', 'b9b12d7439d5ba823edfe597d819800c.png', 'be791fafed75f4e72f3259de3c4f5e34.png'],
  'ver-la-luz': ['c857c3fe2ac954d84df899f24874c21f.jpg', '140edd922479c318b3521f786ac7fec9.jpg', '489dfea912f626b0f4a9aac445c0ead7.jpg', '1d5f867191f1c83d34c8053644a3abe9.jpg'],
  dimension: ['b60238c1c78f744ad295534712cf9747.jpg', 'd13f97dcb55fe21f45c588c2af9239d0.jpg', '5537a147757224418a7b694936f483a3.jpg', 'be1cc05d126071d2b22f9802bef6fbe4.jpg'],
  'volver-a-caer': ['6829f9f730f35ed2314ae0389d7f335b.jpg', '9b3836ba69cae8e023fb42e1d26c5d5f.jpg', 'b363e8e6c6097dead643f66a2892a3c6.jpg', 'b61049c1fd3ef54427924d6772818306.jpg'],
  emperatriz: ['d6e940b7a8e1a0fd2ae934d9ed5355ff.jpg', 'db7ecd95b008663d03341337f4c37d92.jpg', '87b1eba71975584b97971b7a10a84502.jpg'],
  camaleon: ['e36e5c2e2b6a43cb7d4cb95b51c60141.jpg', '3879c412b4ecbbc25f1c8d6051279b39.jpg', '4441e0394da07320d030ee60370a3d33.jpg', 'dbbc260feb09635b29deef22c2190bbd.jpg'],
  'hot-girl-summer': ['94ff0bbc39f87ca5597d90c69fe6cc1c.jpg', '7249c676ff21145ec8b567c975518a1f.jpg', '5683b69e25b39867223e08f7398c5555.jpg', '7376b50c24a888cef97d021f3444b995.jpg'],
  habitada: ['bf9b8b4f1dbff2049e8005d25093684b.jpg', '8d07e849c29caba86105f3c1cc17e611.jpg', 'baa9e21a81a9af959685ceca7d29fb1f.jpg', '9c0425740c46ea56d899fa47e021203e.jpg'],
  'cuando-nadie-me-ve': ['bd88e60d2a6f42bc83b2b65d32cf59ec.jpg', 'bba376a6c23a9afccf5152b7b4afb59c.jpg', '2edda2eea1d54ef82df4f17742148256.jpg', '0b0c0a8034eab15d929e96129a6b13fd.jpg'],
};

async function get(url, out) {
  if (existsSync(out) && statSync(out).size > 0) return;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  writeFileSync(out, Buffer.from(await res.arrayBuffer()));
  console.log(out, Math.round(statSync(out).size / 1048576 * 10) / 10, 'MB');
}

mkdirSync('assets/img/gallery', { recursive: true });
for (const [slug, files] of Object.entries(galleries)) {
  for (const [i, f] of files.entries()) {
    await get(`${BASE}media/${f}`, `assets/img/gallery/${slug}-${i + 1}.${f.split('.').pop()}`);
  }
}

mkdirSync('assets/video/films', { recursive: true });
for (const [slug, id] of Object.entries(films)) {
  await get(`${BASE}video/${id}.mp4`, `assets/video/films/${slug}.mp4`);
}
