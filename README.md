# Pokemon Angular Application

This is an Angular web application converted from a static HTML/CSS Pokemon website.

## Features

- **Home Page**: Welcome page with navigation to all features
- **Quiz Game**: Test your Pokémon knowledge with silhouette challenges
- **Find Game**: Spot hidden Pokémon among trainers in fast-paced gameplay
- **Leaderboards**: View rankings of all players
- **About Page**: Information about the creators
- **Login**: User authentication with bonus points for logged-in users

## Development

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

```bash
npm install
```

### Running the Application

```bash
ng serve
# or
npm start
```

Navigate to `http://localhost:4200/` in your browser.

### Building for Production

```bash
ng build
```

The build artifacts will be stored in the `dist/` directory.

## Project Structure

```
src/
├── app/
│   ├── pages/
│   │   ├── home/          # Home page component
│   │   ├── quiz/          # Quiz game component
│   │   ├── game/          # Find game component
│   │   ├── leaderboards/  # Leaderboards component
│   │   ├── about/         # About page component
│   │   └── login/         # Login component
│   ├── shared/
│   │   ├── navbar/        # Navigation bar component
│   │   └── footer/        # Footer component
│   ├── services/
│   │   ├── auth.service.ts    # Authentication service
│   │   └── users.service.ts    # User data service
│   ├── app.component.ts   # Root component
│   └── app.routes.ts      # Application routes
├── assets/
│   ├── images/            # All image assets
│   └── users.json         # User data
└── styles.css            # Global styles
```

## Technologies Used

- Angular 17
- TypeScript
- RxJS
- CSS3

## Notes

- User data is stored in `assets/users.json`
- Login state is persisted in localStorage
- All images are served from the `assets/images/` directory
- The application uses standalone components (no NgModules)
