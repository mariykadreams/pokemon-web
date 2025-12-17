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

### Environment Setup

1. Copy the example environment file:
   ```bash
   cp src/environments/environment.example.ts src/environments/environment.ts
   cp src/environments/environment.example.ts src/environments/environment.prod.ts
   ```

2. Edit `src/environments/environment.ts` and `src/environments/environment.prod.ts` with your Firebase credentials:
   - `apiKey`: Your Firebase API key
   - `authDomain`: Your Firebase auth domain
   - `projectId`: Your Firebase project ID
   - `storageBucket`: Your Firebase storage bucket
   - `messagingSenderId`: Your messaging sender ID
   - `appId`: Your Firebase app ID
   - `measurementId`: Your Google Analytics measurement ID (optional)

**Important**: The environment files (`environment.ts` and `environment.prod.ts`) are excluded from version control to protect your API keys. Never commit these files to GitHub.

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
│   └── images/            # All image assets
└── styles.css            # Global styles
```

## Technologies Used

- Angular 17
- TypeScript
- RxJS
- CSS3

## Notes

- User data is stored in Firebase Firestore
- Authentication is handled by Firebase Auth
- All images are served from the `assets/images/` directory
- The application uses standalone components (no NgModules)
