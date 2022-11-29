
function formatValeur(valeur) {
    return typeof valeur === "number" ? valeur : `"${valeur}"`;
}
function creerPairJson(json){
    return cle => {
        const p = document.createElement("span");
        p.innerHTML = `"${cle}": ${formatValeur(json[cle])},`;
        p.classList.add("json-pair");
        return p;
    }
}

function ouvrirPopupCopie(json) {
    const precedent = document.getElementById("display-event-text-popup");
    if(precedent) precedent.remove();
    const copiePopup = document.createElement("div");
    copiePopup.id = "display-event-text-popup";
    copiePopup.classList.add("pop-up");

    const spanFermer = document.createElement("span");
    spanFermer.innerHTML = '✖';
    spanFermer.classList.add("clickable", "close-popup");
    spanFermer.addEventListener("click", e => {
        e.stopPropagation();
        toggleVisibilite(copiePopup, false);
    })

    copiePopup.appendChild(spanFermer);

    const div = document.createElement("div");
    div.id = "json-container";

    const cles = ["nom", "qui", "lieu", "lien", "type", "description", "annee", "mois", "jourDebut", "heureDebut", "minuteDebut"]
    if(!!json.jourFin) cles.push("jourFin", "heureFin", "minuteFin");

    const before = document.createElement("span");
    before.innerHTML = "{";
    const pairs = cles.map(creerPairJson(json));
    const after = document.createElement("span");
    after.innerHTML = "},";

    div.append(before, ...pairs, after);

    copiePopup.appendChild(div);
    document.body.appendChild(copiePopup);
    window.getSelection().selectAllChildren(div);
}

/**
 *
 * @param {string}text
 */
function decoupeTexte(text){
    if(text.length > 50){
        return text.split('')
            .reduce((text, caractere) => {
                if (text.length === 49) caractere += "\n";
                return text + caractere;
            })
    }
    return text;
}
function initTool(){
    document.getElementById("tools-button")
        .addEventListener(
            "click", e => {
                e.stopPropagation();
                toggleVisibilite(document.getElementById("pop-up-tools"), true);
            }
        );
    document.getElementById("json-form")
        .addEventListener("submit", e => {
            e.preventDefault();
            const dateDebut = new Date(e.target["input-start-date"].value);
            const lien = e.target["input-link"].value;
            const json = {
                nom: e.target["input-name"].value,
                qui: e.target["input-who"].value,
                lieu: e.target["input-where"].value,
                lien: lien.length ? lien : null,
                type: e.target["input-type"].value,
                description: e.target["input-description"].value,
                annee: dateDebut.getFullYear(),
                mois: dateDebut.getMonth(),
                jourDebut: dateDebut.getDate(),
                heureDebut: dateDebut.getHours(),
                minuteDebut: dateDebut.getMinutes()
            }
            const dateFinStr = e.target["input-end-date"].value;
            const dateFin = dateFinStr.length ? new Date(dateFinStr) : null;
            if(dateFin){
                json["jourFin"] = dateFin.getDate();
                json["heureFin"] = dateFin.getHours();
                json["minuteFin"] = dateFin.getMinutes();
            }
            const texte = JSON.stringify(json, null, "\t") + ",";
            if (navigator.clipboard) {
                navigator.clipboard.writeText(texte)
                    .then(() => {
                        const tooltip = document.getElementById("submit-generate-json");
                        tooltip.classList.add("copied");
                        setTimeout(() => tooltip.classList.remove("copied"), 2000)
                    })
                    .catch(() => ouvrirPopupCopie(texte))
            } else {
                ouvrirPopupCopie(json);
            }
        })
}
