// Tests automatiques des routes API de CineHub.
// Ils utilisent le lanceur de tests intégré à Node.js (node --test), sans dépendance.
//
// Prérequis : l'application doit tourner (npm run dev ou npm run start).
// Lancement :  npm run test:api
// Autre adresse : BASE_URL=http://localhost:3001 npm run test:api

import { test } from "node:test";
import assert from "node:assert/strict";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

// Un email différent à chaque lancement pour ne pas entrer en conflit avec un ancien compte
const uniqueId = Date.now();
const userA = { name: "Testeur A", email: `test-a-${uniqueId}@example.com`, password: "motdepasse123" };
const userB = { name: "Testeur B", email: `test-b-${uniqueId}@example.com`, password: "motdepasse456" };

// Petite fonction d'appel : envoie du JSON et le cookie de session si on en a un
async function callApi(method, path, body, cookie) {
  const headers = { "Content-Type": "application/json" };
  if (cookie) {
    headers.Cookie = cookie;
  }

  const response = await fetch(BASE_URL + path, {
    method: method,
    headers: headers,
    body: body ? JSON.stringify(body) : undefined,
    redirect: "manual",
  });

  let data = null;
  if ((response.headers.get("content-type") || "").includes("application/json")) {
    data = await response.json();
  }

  return { status: response.status, data: data, headers: response.headers };
}

// Inscription + connexion, retourne le cookie de session
async function registerAndLogin(user) {
  const register = await callApi("POST", "/api/auth/register", { ...user, confirmPassword: user.password });
  assert.equal(register.status, 201);

  const login = await callApi("POST", "/api/auth/login", { email: user.email, password: user.password });
  assert.equal(login.status, 200);

  const setCookie = login.headers.get("set-cookie");
  assert.ok(setCookie && setCookie.includes("cinehub_session="), "le cookie de session doit être créé");
  assert.ok(setCookie.toLowerCase().includes("httponly"), "le cookie doit être HttpOnly");

  return setCookie.split(";")[0]; // "cinehub_session=..."
}

let cookieA = "";
let cookieB = "";
let movieId = 0;

test("le catalogue est accessible aux visiteurs", async () => {
  const response = await fetch(BASE_URL + "/movies");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.ok(html.includes("Inception"));

  // On récupère l'id du premier film de la page
  const match = html.match(/href="\/movies\/(\d+)"/);
  assert.ok(match, "un lien vers une fiche de film doit exister");
  movieId = Number(match[1]);
});

test("la recherche par titre est insensible à la casse", async () => {
  const response = await fetch(BASE_URL + "/search?q=INTER");
  const html = await response.text();
  assert.ok(html.includes("Interstellar"));
  assert.ok(!html.includes("Whiplash"));

  const empty = await fetch(BASE_URL + "/search?q=zzzzzz");
  assert.ok((await empty.text()).includes("Aucun film ne correspond"));
});

test("un visiteur ne peut pas utiliser les fonctions protégées", async () => {
  const favorite = await callApi("POST", "/api/favorites", { movieId: 1 });
  assert.equal(favorite.status, 401);

  const review = await callApi("POST", "/api/reviews", { movieId: 1, rating: 5, comment: "Super" });
  assert.equal(review.status, 401);

  const ai = await callApi("POST", "/api/ai/recommend", { preferences: "science-fiction" });
  assert.equal(ai.status, 401);

  // Les pages privées redirigent vers la connexion
  const library = await callApi("GET", "/library");
  assert.ok([307, 308].includes(library.status));
  assert.ok(library.headers.get("location").includes("/login"));
});

test("l'inscription vérifie les données", async () => {
  const badEmail = await callApi("POST", "/api/auth/register", {
    name: "X", email: "pas-un-email", password: "motdepasse123", confirmPassword: "motdepasse123",
  });
  assert.equal(badEmail.status, 400);

  const shortPassword = await callApi("POST", "/api/auth/register", {
    name: "X", email: `x-${uniqueId}@example.com`, password: "123", confirmPassword: "123",
  });
  assert.equal(shortPassword.status, 400);

  const differentPasswords = await callApi("POST", "/api/auth/register", {
    name: "X", email: `x-${uniqueId}@example.com`, password: "motdepasse123", confirmPassword: "autre12345",
  });
  assert.equal(differentPasswords.status, 400);
});

test("inscription et connexion de deux utilisateurs", async () => {
  cookieA = await registerAndLogin(userA);
  cookieB = await registerAndLogin(userB);

  // Email déjà utilisé
  const duplicate = await callApi("POST", "/api/auth/register", { ...userA, confirmPassword: userA.password });
  assert.equal(duplicate.status, 409);

  // Mauvais mot de passe
  const wrongLogin = await callApi("POST", "/api/auth/login", { email: userA.email, password: "mauvais123" });
  assert.equal(wrongLogin.status, 401);
});

test("modification du profil", async () => {
  const response = await callApi("PUT", "/api/profile", { name: "Testeur A modifié", email: userA.email }, cookieA);
  assert.equal(response.status, 200);
  assert.equal(response.data.user.name, "Testeur A modifié");

  // Impossible de prendre l'email d'un autre utilisateur
  const conflict = await callApi("PUT", "/api/profile", { name: "A", email: userB.email }, cookieA);
  assert.equal(conflict.status, 409);
});

test("CRUD de la bibliothèque personnelle", async () => {
  // Create
  const created = await callApi("POST", "/api/library", { movieId, status: "TO_WATCH", personalNote: "Avec Paul" }, cookieA);
  assert.equal(created.status, 201);
  const entryId = created.data.entry.id;

  // Doublon refusé
  const duplicate = await callApi("POST", "/api/library", { movieId }, cookieA);
  assert.equal(duplicate.status, 409);

  // Read
  const page = await fetch(BASE_URL + "/library", { headers: { Cookie: cookieA } });
  assert.ok((await page.text()).includes("Avec Paul"));

  // Update
  const updated = await callApi("PUT", `/api/library/${entryId}`, { status: "WATCHED", personalNote: "Génial" }, cookieA);
  assert.equal(updated.status, 200);
  assert.equal(updated.data.entry.status, "WATCHED");

  // Un autre utilisateur ne peut ni modifier ni supprimer cette entrée
  const otherUpdate = await callApi("PUT", `/api/library/${entryId}`, { status: "WATCHING" }, cookieB);
  assert.equal(otherUpdate.status, 404);
  const otherDelete = await callApi("DELETE", `/api/library/${entryId}`, null, cookieB);
  assert.equal(otherDelete.status, 404);

  // Statut invalide
  const badStatus = await callApi("PUT", `/api/library/${entryId}`, { status: "NIMPORTEQUOI" }, cookieA);
  assert.equal(badStatus.status, 400);

  // Delete
  const deleted = await callApi("DELETE", `/api/library/${entryId}`, null, cookieA);
  assert.equal(deleted.status, 200);
});

test("ajout et retrait des favoris", async () => {
  const added = await callApi("POST", "/api/favorites", { movieId }, cookieA);
  assert.equal(added.status, 201);

  let page = await fetch(BASE_URL + "/favorites", { headers: { Cookie: cookieA } });
  assert.ok((await page.text()).includes(`/movies/${movieId}`));

  const removed = await callApi("DELETE", `/api/favorites/${movieId}`, null, cookieA);
  assert.equal(removed.status, 200);

  page = await fetch(BASE_URL + "/favorites", { headers: { Cookie: cookieA } });
  assert.ok((await page.text()).includes("aucun film favori"));
});

test("avis : création, modification, suppression et note moyenne", async () => {
  // Note hors limites refusée
  const badRating = await callApi("POST", "/api/reviews", { movieId, rating: 6, comment: "Trop bien" }, cookieA);
  assert.equal(badRating.status, 400);

  // A met 5, B met 2 : moyenne 3.5
  const reviewA = await callApi("POST", "/api/reviews", { movieId, rating: 5, comment: "Excellent film" }, cookieA);
  assert.equal(reviewA.status, 201);
  const reviewB = await callApi("POST", "/api/reviews", { movieId, rating: 2, comment: "Pas pour moi" }, cookieB);
  assert.equal(reviewB.status, 201);

  let html = await (await fetch(BASE_URL + `/movies/${movieId}`)).text();
  assert.ok(html.includes("3.5"), "la moyenne doit être 3.5");

  // Un seul avis par utilisateur et par film
  const second = await callApi("POST", "/api/reviews", { movieId, rating: 1, comment: "Encore moi" }, cookieA);
  assert.equal(second.status, 409);

  // B ne peut pas modifier l'avis de A
  const otherUpdate = await callApi("PUT", `/api/reviews/${reviewA.data.review.id}`, { rating: 1, comment: "Piraté" }, cookieB);
  assert.equal(otherUpdate.status, 404);

  // B modifie son propre avis : 4 -> moyenne 4.5
  const update = await callApi("PUT", `/api/reviews/${reviewB.data.review.id}`, { rating: 4, comment: "Finalement bien" }, cookieB);
  assert.equal(update.status, 200);
  html = await (await fetch(BASE_URL + `/movies/${movieId}`)).text();
  assert.ok(html.includes("4.5"), "la moyenne doit passer à 4.5");

  // Suppression des deux avis : plus de note
  assert.equal((await callApi("DELETE", `/api/reviews/${reviewA.data.review.id}`, null, cookieA)).status, 200);
  assert.equal((await callApi("DELETE", `/api/reviews/${reviewB.data.review.id}`, null, cookieB)).status, 200);
  html = await (await fetch(BASE_URL + `/movies/${movieId}`)).text();
  assert.ok(html.includes("Pas encore noté"));
});

test("assistant : validation de la demande", async () => {
  const tooShort = await callApi("POST", "/api/ai/recommend", { preferences: "a" }, cookieA);
  assert.equal(tooShort.status, 400);

  const response = await callApi("POST", "/api/ai/recommend", { preferences: "Un film d'action après 2015" }, cookieA);
  assert.equal(response.status, 200);
  assert.ok(["ai", "fallback"].includes(response.data.mode));
  assert.ok(Array.isArray(response.data.recommendations));
});

test("le manifeste PWA et le service worker sont servis", async () => {
  const manifestResponse = await fetch(BASE_URL + "/manifest.webmanifest");
  assert.equal(manifestResponse.status, 200);
  const manifest = await manifestResponse.json();
  assert.equal(manifest.name, "CineHub");
  assert.equal(manifest.display, "standalone");
  assert.ok(manifest.icons.some((icon) => icon.sizes === "192x192"));
  assert.ok(manifest.icons.some((icon) => icon.sizes === "512x512"));

  const sw = await fetch(BASE_URL + "/sw.js");
  assert.equal(sw.status, 200);

  const offline = await fetch(BASE_URL + "/offline");
  assert.equal(offline.status, 200);
});

test("déconnexion : la session n'est plus valable", async () => {
  const logout = await callApi("POST", "/api/auth/logout", null, cookieA);
  assert.equal(logout.status, 200);

  // L'ancien cookie ne fonctionne plus, même s'il est renvoyé
  const afterLogout = await callApi("POST", "/api/favorites", { movieId }, cookieA);
  assert.equal(afterLogout.status, 401);

  await callApi("POST", "/api/auth/logout", null, cookieB);
});
