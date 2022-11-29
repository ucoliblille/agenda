const date = new Date();
const moisActuel = date.getMonth();
const anneeActuel = date.getFullYear();
let moisChoisi = moisActuel;

const evenements = evenementsFactory();


/**
 * @param {string} nom
 * @param {string} qui
 * @param {string} description
 * @param {string} lien
 * @param {string} lieu
 * @param {number} annee
 * @param {number} mois
 * @param {string} type
 * @param {number} jourDebut
 * @param {number} heureDebut
 * @param {number} minuteDebut
 * @param {number} jourFin
 * @param {number} heureFin
 * @param {number} minuteFin
 */
function Evenement(nom, qui, description, lien, lieu, annee, mois, type, jourDebut, heureDebut, minuteDebut, jourFin, heureFin, minuteFin){
    this.nom = nom;
    this.qui = qui;
    this.description = description;
    this.lien = lien;
    this.lieu = lieu;
    this.type = type;
    this.dateDebut = new Date(annee, mois, jourDebut, heureDebut, minuteDebut);
    if(!!jourFin){
        this.dateFin = new Date(annee, mois, jourFin, heureFin, minuteFin);
    }
}

/**
 * @param {number} mois
 * @param {number} numero
 * @param {HTMLElement[]} evenements
 */
function Jour(mois, numero, evenements = []){
    this.numero = numero;
    this.appartientMoisChoisi = moisChoisi === mois;
    this.evenements = evenements;
}

function initCalendar(){
    const selectionMoisEl = document.getElementById("selection-mois");
    selectionMoisEl.addEventListener("change", selectionMois);
    selectionMoisEl.value = moisActuel;
    document.getElementById("pop-up-event").addEventListener("click", e => e.stopPropagation())
    document.getElementById("annee").innerText = anneeActuel + '';
    const dateFinEl = document.getElementById("input-end-date");
    document.getElementById("input-start-date")
        .addEventListener("change", e => {
            dateFinEl.setAttribute("min", e.target.value);
        })
    actualiserJours();
}
function actualiserJours(){
    const gridCalendrier = document.getElementById("calendar");
    const totalJours = [...joursMoisPrecedent(), ...joursMoisChoisi(), ...joursMoisSuivant()];
    for(let j = 0; j < totalJours.length; j++) {
        const {numero, appartientMoisChoisi, evenements} = totalJours[j];
        const el = jourElem(numero);
        if(!appartientMoisChoisi) el.classList.add("day--disabled");
        if(numero === new Date().getDate() && moisActuel === moisChoisi) el.classList.add("day--current")
        const div = document.createElement("div");
        evenements.forEach(evenementEl => {
            div.appendChild(evenementEl)
        })
        el.appendChild(div);
        gridCalendrier.appendChild(el);
    }
}
function resetJours(){
    let dayEl = [];
    for (const el of document.getElementsByClassName("day")) {
        dayEl.push(el);
    }
    dayEl.forEach(el => el.remove());
}

/**
 *
 * @param {Event} e
 */
function selectionMois(e){
    moisChoisi = Number.parseInt(e.target.value);
    resetJours();
    actualiserJours();
}

/**
 *
 * @param {number}jour
 * @returns {HTMLDivElement}
 */
function jourElem(jour){
    const elem = document.createElement("div");
    elem.className = "day";
    const h5 = document.createElement("h5");
    h5.innerText = jour + '';
    elem.appendChild(h5);
    return elem;
}

/**
 *
 * @param {Evenement} evenement
 */
function clickDetails(evenement) {
    return e => {
        e.stopPropagation();
        remplirPopup(evenement);
        toggleVisibilite(document.getElementById("pop-up-event"), true);
    };
}

/**
 *
 * @return {Map<number, HTMLElement[]>}
 */
function genererEvenementsMoisChoisi() {
    const map = new Map();
    const evenementsTries = evenements.filter(e => e.dateDebut.getMonth() === moisChoisi);
    evenementsTries.sort((a, b) => a.dateDebut - b.dateDebut)
    evenementsTries.forEach(e => {
            const premierJour = e.dateDebut.getDate();
            const dernierJour = (e.dateFin || e.dateDebut).getDate();
            const values = map.get(premierJour) || [];
            values.push(creerEvenement(e, premierJour));
            map.set(premierJour, values);

            const diff = dernierJour - premierJour;
            if (diff > 0) {
                for (let j = 1; j <= diff; j++) {
                    const n = premierJour + j;
                    const values2 = map.get(n) || [];
                    values2.push(creerEvenement(e,  n));
                    map.set(n, values2);
                }
            }
    })
    return map;
}

/**
 *
 * @returns {Jour[]}
 */
function joursMoisChoisi() {
    const evenementsMap = genererEvenementsMoisChoisi();
    const nbJoursMois = new Date(anneeActuel, moisChoisi + 1, 0).getDate();
    let jour = 1;
    return new Array(nbJoursMois)
        .fill(0)
        .map(j => {
            const numeroJour = jour++;
            return new Jour(moisChoisi, numeroJour, evenementsMap.get(numeroJour) || []);
        })
}

/**
 *
 * @returns {Jour[]}
 */
function joursMoisPrecedent(){
    const premierJour = new Date(anneeActuel, moisChoisi, 1).getDay();
    const nbJourApresDernierLundi = premierJour === 0 ? 6 : Math.abs(1 - premierJour)
    let nbJourMoisPrec = new Date(anneeActuel, moisChoisi, 0).getDate();
    return new Array(nbJourApresDernierLundi)
        .fill(0)
        .map(j => new Jour(moisChoisi - 1, nbJourMoisPrec--))
        .sort((a, b) => a.numero - b.numero);
}

/**
 *
 * @returns {Jour[]}
 */
function joursMoisSuivant(){
    const nbJourMoisChoisi = new Date(anneeActuel, moisChoisi + 1, 0).getDate();
    const dernierJour = new Date(anneeActuel, moisChoisi, nbJourMoisChoisi).getDay();
    const nbJourJusquaLundi = dernierJour === 0 ? 0 : 7 - dernierJour;
    let jour = 1;
    return new Array(nbJourJusquaLundi)
        .fill(0)
        .map(j => new Jour(moisChoisi + 1, jour++));
}

/**
 *
 * @param {number} annee
 * @param {number} mois
 * @return {Evenement[]}
 */
function evenementsFactory(){
    return data.filter(e => e.annee === anneeActuel)
        .map(e => new Evenement(e.nom, e.qui, e.description, e.lien, e.lieu, e.annee, e.mois - 1, e.type, e.jourDebut, e.heureDebut, e.minuteDebut, e.jourFin, e.heureFin, e.minuteFin))
}

/**
 *
 * @param {Evenement} e
 * @param {number} jour
 * @return {HTMLElement}
 */
function creerEvenement(e, jour){
    const evenement = document.createElement("section");
    evenement.classList.add("task", e.type, "clickable");
    evenement.innerText = e.nom;

    if(e.dateDebut.getDate() === jour){
        evenement.classList.add("start");
    }
    evenement.addEventListener("click", clickDetails(e, ))
    return evenement;
}

/**
 * @param {Evenement} evenement
 * @return {HTMLDivElement}
 * @param {Evenement} e
 */
function remplirPopup(e){
    document.getElementById("titre").innerText = e.nom;
    document.getElementById("date").innerText = e.dateDebut.toLocaleDateString() + (!!e.dateFin ? " - " + e.dateFin.toLocaleDateString() : '');
    const heureFin = !!e.dateFin ? ` - ${formatHeure(e.dateFin)}` : '';
    document.getElementById("heure").innerText = formatHeure(e.dateDebut) + heureFin;
    document.getElementById("lieu").innerText = e.lieu;
    document.getElementById("qui").innerText = e.qui;
    document.getElementById("link").innerText = e.lien || "...";
    document.getElementById("description").innerText = e.description;
}

function formatHeure(date){
    return `${date.getHours()}:${date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes()}`
}

