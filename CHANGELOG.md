# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Staging environment configuration
- Additional analytics tracking
- API integration documentation

### Planned
- Dark mode support
- Multi-language support (i18n)
- Advanced search filters
- User profile management

## [0.1.0] - 2026-04-18

### Added
- Initial stable release of Review Portal Frontend
- Equipment catalogue with search and filtering
- Dynamic pricing calculator (hourly, daily, weekly rates)
- Review and rating system
- Equipment detail pages with specifications
- User feedback forms
- Hero section with featured equipment
- Category browsing
- Responsive mobile design
- Type-safe TypeScript configuration
- ESLint and Prettier integration
- GitHub Actions CI/CD pipeline
- Azure App Service deployment configuration
- GitHub Packages npm registry setup

### Fixed
- Next.js 15 params compatibility for dynamic routes
- Build optimization for production deployments

### Technical Details
- Next.js 15.5.9 with App Router
- React 19 with hooks
- Tailwind CSS 4 for styling
- Radix UI for accessible components
- React Hook Form with Zod validation
- TypeScript strict mode enabled

---

## Release Notes Format

### Unreleased
Changes that will be included in the next release but haven't been released yet.

### [Version Number] - YYYY-MM-DD
The release date in ISO 8601 format (YYYY-MM-DD).

### Sections
- **Added** - New features
- **Changed** - Changes in existing functionality
- **Deprecated** - Features soon to be removed
- **Removed** - Features that were removed
- **Fixed** - Bug fixes
- **Security** - Security fixes

---

## How to Update

When making a new release, follow these steps:

1. Update the version in `package.json`
2. Move "Unreleased" section to a new version section with today's date
3. Add the version to this file
4. Commit with message: `chore: release v0.x.x`
5. Create a Git tag: `git tag v0.x.x`
6. Push and create a GitHub Release

Example next release:

```markdown
## [0.2.0] - 2026-05-01

### Added
- Dark mode support
- User authentication system
- Profile management page

### Fixed
- Equipment image loading on slow connections
```

---

**Versioning Guide:**
- **MAJOR** (v1.0.0) - Breaking changes
- **MINOR** (v0.1.0) - New features, backward compatible
- **PATCH** (v0.1.1) - Bug fixes only
