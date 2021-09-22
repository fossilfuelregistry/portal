# fossilfuelregistry.org web client

## Stack

The client is based on the NextJS framework.

It is based on:

- Redux for app state management
- Ant Design with a custom theme for UI components
- Apollo GraphQL for data fetching
- The POEditor translation service for i18n texts
- AirBnB VisX for chart graphics
- MaplibreGL with a private vector tile server for maps

## Building

The build process is 100% standard NextJS. It needs a `.env.local` file for various keys:

```
POEDITOR_API_TOKEN=...
POEDITOR_PROJECT_ID=...

NEXT_PUBLIC_BACKEND_URL=https://api.fossilfuelregistry.org

NEXT_PUBLIC_GA=... (Google Analytics Property id)
NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY=...
NEXT_PUBLIC_OPENCORPORATES_API_TOKEN=...
```
