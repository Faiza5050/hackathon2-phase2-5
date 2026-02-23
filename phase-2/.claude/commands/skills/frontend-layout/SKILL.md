---
name: frontend-layout
description: Build responsive pages, reusable components, layouts, and apply styling for modern web interfaces.
---

# Frontend Layout & Components

## Instructions

1. **Page Layout**
   - Use semantic HTML (`<header>`, `<main>`, `<footer>`)
   - Grid or Flexbox for responsive structure
   - Mobile-first breakpoints

2. **Components**
   - Buttons, cards, forms, modals
   - Reusable sections (hero, features, testimonials)

3. **Styling**
   - Consistent colors, fonts, spacing
   - Hover/focus states for interactivity

4. **Responsive Design**
   - Stack elements vertically on small screens
   - Adjust padding/margins for readability

5. **Animations & Effects**
   - Subtle hover/fade-in
   - Smooth scrolling
   - Optional transitions or parallax

## Best Practices
- Keep components small and reusable
- Maintain consistent spacing and typography
- Clear visual hierarchy
- Test on multiple screen sizes
- Use semantic HTML for accessibility

## Example Structure
```html
<header class="bg-gray-100 p-4">
  <nav class="flex justify-between items-center">
    <a href="#" class="font-bold text-xl">Brand</a>
    <ul class="flex gap-4">
      <li><a href="#features">Features</a></li>
      <li><a href="#contact">Contact</a></li>
    </ul>
  </nav>
</header>

<main class="p-6 grid gap-8">
  <section class="hero h-screen flex flex-col justify-center items-center text-center">
    <h1 class="text-4xl font-bold">Welcome to Our Site</h1>
    <p class="mt-4 text-lg">Build responsive and reusable components easily.</p>
    <button class="mt-6 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
      Get Started
    </button>
  </section>

  <section id="features" class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div class="card p-4 border rounded shadow hover:shadow-lg transition">
      <h2 class="font-semibold text-xl">Feature 1</h2>
      <p class="mt-2 text-gray-600">Description of the feature.</p>
    </div>
    <div class="card p-4 border rounded shadow hover:shadow-lg transition">
      <h2 class="font-semibold text-xl">Feature 2</h2>
      <p class="mt-2 text-gray-600">Description of the feature.</p>
    </div>
    <div class="card p-4 border rounded shadow hover:shadow-lg transition">
      <h2 class="font-semibold text-xl">Feature 3</h2>
      <p class="mt-2 text-gray-600">Description of the feature.</p>
    </div>
  </section>
</main>

<footer class="bg-gray-100 p-4 text-center">
  &copy; 2026 Your Company
</footer>
