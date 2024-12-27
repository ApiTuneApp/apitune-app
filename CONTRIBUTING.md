# Contributing to ApiTune

Thank you for your interest in contributing to ApiTune! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct. Please report unacceptable behavior to [project maintainers].

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, please include as many details as possible by filling out the bug report template.

### Suggesting Enhancements

If you have ideas for new features or improvements, we'd love to hear them! Please use the feature request template to submit your suggestions.

### Development Process

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Start development server:
```bash
pnpm dev
```

### Building

For different platforms:
```bash
# Windows
pnpm build:win

# macOS
pnpm build:mac

# Linux
pnpm build:linux
```

### Code Style

- We use ESLint and Prettier for code formatting
- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features when possible

### Pull Request Process

1. Update the README.md with details of changes if needed
2. Update the documentation if you're changing functionality
3. The PR will be merged once you have the sign-off of at least one maintainer

## License

By contributing to ApiTune, you agree that your contributions will be licensed under its MIT license.
