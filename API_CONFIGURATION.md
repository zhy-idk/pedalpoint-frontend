# API Configuration

This project uses environment variables to configure the API base URL, making it easy to switch between different environments (development, staging, production).

## Setup

### 1. Create Environment File

Create a `.env` file in the root directory of the project:

```bash
# .env
VITE_API_BASE_URL=http://localhost:8000
```

### 2. Environment Variables

- `VITE_API_BASE_URL`: The base URL for all API calls
  - Development: `http://localhost:8000`
  - Staging: `https://staging-api.yourdomain.com`
  - Production: `https://api.yourdomain.com`

## Usage

The API base URL is automatically imported from the centralized configuration:

```typescript
import { apiBaseUrl } from '../api/index';

// Use in fetch calls
const response = await fetch(`${apiBaseUrl}/api/cart/`);
```

## Benefits

1. **Easy Environment Switching**: Change the API URL in one place
2. **No Hardcoded URLs**: All API calls use the centralized configuration
3. **Environment-Specific Configs**: Different `.env` files for different environments
4. **Fallback Support**: Defaults to `http://localhost:8000` if no environment variable is set

## Files Updated

The following files have been updated to use the centralized API configuration:

- `src/api/index.ts` - Centralized API configuration
- `src/pages/Login.tsx` - Login API calls
- `src/providers/CartProvider.tsx` - Cart API calls
- `src/pages/Repair.tsx` - Repair service API calls
- `src/pages/SearchResult.tsx` - Search API calls
- `src/hooks/useRecommendations.ts` - Recommendations API calls

## Example Environment Files

### Development (.env.development)
```bash
VITE_API_BASE_URL=http://localhost:8000
```

### Staging (.env.staging)
```bash
VITE_API_BASE_URL=https://staging-api.yourdomain.com
```

### Production (.env.production)
```bash
VITE_API_BASE_URL=https://api.yourdomain.com
```

## Notes

- Environment variables must start with `VITE_` to be accessible in the frontend
- The `.env` file should be added to `.gitignore` to avoid committing sensitive information
- Use `.env.example` as a template for other developers
