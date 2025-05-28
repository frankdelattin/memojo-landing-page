# Memojo Landing Page - Coding Rules

## General Guidelines

1. **File Organization**
   - Keep files organized in their respective directories (HTML in root, CSS in `/css`, JavaScript in `/js`, images in `/images`)
   - Use descriptive filenames in lowercase with hyphens for spaces

2. **Code Formatting**
   - Use 2-space indentation consistently across all files
   - Maintain a maximum line length of 100 characters
   - Include a blank line at the end of each file
   - Remove all trailing whitespace

3. **Code Quality**
   - Keep code clean and documented
   - Avoid duplicate code wherever possible
   - Always choose the simplest option that meets requirements
   - Don't touch code that works unless strictly necessary

## HTML Guidelines

1. **Structure**
   - Use semantic HTML5 elements (`header`, `section`, `footer`, etc.)
   - Include proper meta tags and document structure
   - Ensure all elements have proper closing tags

2. **Accessibility**
   - Use proper ARIA attributes where necessary
   - All images must have meaningful `alt` attributes
   - Maintain proper heading hierarchy (h1, h2, h3)
   - Ensure sufficient color contrast for text readability

3. **Best Practices**
   - Use lowercase for all HTML tags and attributes
   - Use double quotes for attribute values
   - Include proper lang attribute in the html tag

## CSS Guidelines

1. **Styling**
   - Use CSS variables for colors, transitions, and reusable values
   - Follow mobile-first responsive design principles
   - Group related styles together with meaningful comments
   - Use descriptive class names that reflect the purpose (BEM naming convention preferred)
   - Avoid duplicate code at all costs where possible - ensure selectors only appear once

2. **Organization**
   - Organize CSS in logical sections (reset, base, components, utilities)
   - Document any complex CSS techniques with comments
   - Avoid using !important unless absolutely necessary

3. **Performance**
   - Minimize use of CSS animations for performance
   - Use appropriate units (rem for font sizes, % or viewport units for responsive elements)
   - Avoid deeply nested selectors

## JavaScript Guidelines

1. **Best Practices**
   - Use ES6+ syntax where possible
   - Always use strict mode ('use strict')
   - Declare variables with const or let (avoid var)
   - Use meaningful function and variable names
   - Organize code into logical sections with comments

2. **DOM Interactions**
   - Cache DOM selections that are reused
   - Use event delegation for repeated elements
   - Remove event listeners when they're no longer needed

3. **Performance**
   - Debounce scroll and resize event handlers
   - Minimize DOM manipulation operations
   - Use requestAnimationFrame for animations

## Git Workflow

1. **Commits**
   - Write clear, concise commit messages
   - Make atomic commits (one logical change per commit)
   - Reference issue numbers in commit messages when applicable

2. **Branches**
   - Use feature branches for new functionality
   - Use fix branches for bug fixes
   - Always pull latest changes before creating a new branch

## Design Consistency

1. **Visual Elements**
   - Maintain Apple-inspired minimalist aesthetic
   - Ensure consistent spacing using predefined values
   - Follow the established color palette defined in CSS variables

2. **Typography**
   - Use the Inter font family consistently
   - Maintain heading size hierarchy
   - Ensure proper line height for readability

## Documentation

1. **Code Comments**
   - Document complex logic or non-obvious code
   - Use JSDoc style comments for JavaScript functions
   - Include TODO comments for future improvements
   
2. **README Updates**
   - Keep README.md up to date with project changes
   - Document new features and significant updates

## Testing

1. **Cross-Browser**
   - Test in Chrome, Firefox, Safari, and Edge
   - Ensure responsive design works on all target screen sizes

2. **Performance**
   - Run Lighthouse audits periodically
   - Optimize image sizes before adding to the project

## Environment-Specific Rules

1. **PowerShell Environment**
   - Use `py` instead of `python` for Python commands
   - Remember to account for PowerShell-specific syntax for scripts and commands
