# Boxy - Packaging Template Designer

Interactive web app for designing custom packaging templates with cutting and folding patterns.

## Features

- **Multiple Box Styles**: Choose from various packaging designs (with more coming soon)
- **Parametric Design**: Adjust box dimensions, tuck flaps, and dust flaps in real-time
- **Live Preview**: See the pattern update instantly as you modify parameters
- **Display Options**: Toggle dimensions, labels, and 10mm grid overlay with adjustable zoom
- **Export Formats**: SVG, PNG, PDF, DXF (with 1:1 mm scale for production)

## Project Structure

```
boxy/
├── index.html                          # Home page with style selection
├── styles/
│   ├── single-piece-folding-lid.html   # Shoe box style
│   └── triangular-prism.html           # Toblerone-style box
├── js/
│   ├── export.js                       # Universal export module
│   ├── single-piece-folding-lid.js     # Shoe box logic
│   └── triangular-prism.js             # Triangular prism logic
└── README.md
```

## Available Styles

- **Single Piece Folding Lid** - Classic shoe box design with integrated lid and double-wall construction
- **Triangular Prism Box** - Toblerone-style box with interlocking end flaps, no glue required

### Coming Soon
- Tuck End Box
- Mailer Box
- Pillow Box
- Sleeve & Tray
- Hexagon Box

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
