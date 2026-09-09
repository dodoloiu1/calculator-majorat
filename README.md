# 📸 Calculator Foto Majorat • Photos by Dodo

> Calculator simplu și rapid pentru servicii foto de majorat. Design curat (fundal alb, chenare gri, accent navy blue).

[![Instagram](https://img.shields.io/badge/Instagram-@photosby__dodo-1e3a8a?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/photosby_dodo/)
[![Live Demo](https://img.shields.io/badge/Demo-Live%20Website-1e3a8a?style=for-the-badge)](https://dodoloiu1.github.io/calculator-majorat/)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdodoloiu1%2Fcalculator-majorat)

---

## 🧮 Formula de Calcul

$$\text{PREȚ} = 200 + 80 \times (\text{ORE} - 1) + 5 \times \max(0, \text{PERSOANE} - 30) + \text{TRANSPORT}$$

- **200 lei** = prețul de bază pentru prima oră
- **80 lei** = fiecare oră în plus
- **30 persoane** = numărul de persoane inclus în preț
- **5 lei** = pentru fiecare persoană peste 30
- $\max(0, \text{persoane} - 30)$ = dacă sunt sub 30 persoane, nu se scade din preț
- **Transport** = costul deplasării (dacă este cazul)

### Exemple verificate:
- **6h / 20 persoane** → 600 lei
- **6h / 30 persoane** → 600 lei
- **6h / 50 persoane** → 700 lei
- **7h / 50 persoane** → 780 lei
- **7h / 60 persoane** → 830 lei
- **9h / 60 persoane** → 990 lei

---

## ⚡ Caracteristici

- **Fundal alb**, **chenare gri**, **accent navy blue** (`#1e3a8a`).
- **Slider simplu** pentru număr persoane cu incrementare din 5 în 5 (butoane `-5` / `+5`).
- **Interval orar** (Ora început + Ora final cu calcul automat durata).
- **Câmp opțional pentru Transport / Deplasare**.
- **Trimitere calcul pe WhatsApp** printr-un click.
- **Link direct către Instagram**: [@photosby_dodo](https://www.instagram.com/photosby_dodo/).
