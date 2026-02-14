# Boxy - Shoe Box Designer

Interactive web app for designing single-piece folding lid shoe box packaging with cutting and folding patterns.

## Features

- **Parametric Design**: Adjust box dimensions, tuck flaps, and dust flaps in real-time
- **Live Preview**: See the pattern update instantly as you modify parameters
- **Display Options**: Toggle dimensions, labels, and 10mm grid overlay with adjustable zoom
- **Export Formats**: SVG, PNG, PDF (with 1:1 mm scale for production)

## Pattern Structure

The shoe box uses a **single-piece folding lid** design:

```
    ┌──────────┬─────┬──────────┐
    │   tuck   │TUCK │   tuck   │
    ├──────────┼─────┼──────────┤
    │   tuck   │ LID │   tuck   │
    │          │ TOP │          │
    ├──────────┼─────┼──────────┤
    │   dust   │FRONT│   dust   │
    │          │WALL │          │
    ├────┬─────┼─────┼─────┬────┤
    │SIDE│INNER│BASE │INNER│SIDE│
    │WALL│     │     │     │WALL│
    ├────┴─────┼─────┼─────┴────┤
    │   dust   │BACK │   dust   │
    │          │WALL │          │
    └──────────┴─────┴──────────┘
```

- **Solid lines**: Cut lines
- **Dashed lines**: Fold lines
- **Tuck flaps**: Have rounded corners for easy insertion
- **Dust flaps**: Have chamfered corners

## Parameters

| Parameter | Range | Description |
|-----------|-------|-------------|
| Length (L) | 50–400 mm | Base length |
| Width (W) | 30–300 mm | Base width |
| Height (H) | 20–200 mm | Wall height |
| Tuck Width | 10–50 mm | Tuck flap depth |
| Tuck Roundness | 0–20 mm | Corner radius on tuck flaps |
| Dust Width | 0–100% | Dust flap width (% of W/2) |

## Tech Stack

- **Tailwind CSS** — Styling via CDN
- **Alpine.js** — Reactive UI bindings
- **jsPDF** — PDF generation

## Usage

1. Open `index.html` in a browser (or via localhost)
2. Adjust parameters using the sidebar sliders
3. Toggle display options as needed
4. Export in your desired format (SVG/PNG/PDF)
