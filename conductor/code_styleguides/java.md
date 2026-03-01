# Java Style Guide

This guide establishes the style and best practice conventions for writing consistent and maintainable Java code.

## 1. Naming Conventions

Consistency in naming is key to readability.

### 1.1. Classes, Interfaces, and Enums

-   **PascalCase:** Names should use `PascalCase` (or `UpperCamelCase`).
-   **Nouns:** They are generally nouns or noun phrases.
-   **Examples:** `class RasterImage;`, `interface EventListener;`, `enum Color;`

### 1.2. Methods

-   **camelCase:** Names should use `camelCase` (or `lowerCamelCase`).
-   **Verbs:** They are generally verbs or verb phrases.
-   **Examples:** `void sendMessage();`, `int calculateTotal();`

### 1.3. Variables

-   **camelCase:** Local and instance variables should use `camelCase`.
-   **Examples:** `int currentCount;`, `String userName;`

### 1.4. Constants

-   **UPPER_SNAKE_CASE:** Constants (`static final`) should use `UPPER_SNAKE_CASE`.
-   **Examples:** `static final int MAX_RETRIES = 3;`

## 2. Code Formatting

### 2.1. Indentation

-   Use **4 spaces** for indentation, not tabs.

### 2.2. Line Length

-   Each line of text in your code should have a maximum of **120 characters**.

### 2.3. Brace Style

-   Use the "Egyptian" style, where the opening brace (`{`) is on the same line as the declaration.

```java
// Correct
if (condition) {
    // ...
}

// Incorrect
if (condition)
{
    // ...
}
```

## 3. Comments

### 3.1. Javadoc

-   Use `/** ... */` to document all public classes, interfaces, enums, and methods.
-   It should describe what the method does, and document parameters (`@param`), return values (`@return`), and thrown exceptions (`@throws`).

```java
/**
 * Calculates the total based on quantity and price.
 *
 * @param quantity The number of items.
 * @param price The price per item.
 * @return The calculated total price.
 * @throws IllegalArgumentException if quantity or price are negative.
 */
public int calculateTotal(int quantity, double price) {
    // ...
}
```

### 3.2. Implementation Comments

-   Use `//` for single-line comments and `/* ... */` for block comments when needed to clarify complex logic. Do not comment on the obvious.

## 4. Best Practices

-   **Use `Optional`:** Prefer `Optional<T>` instead of returning `null` to indicate the absence of a value.
-   **Streams API:** Use the Streams API to process collections declaratively and readably.
-   **Exception Handling:** Do not ignore exceptions with empty `catch` blocks. Handle or re-throw them appropriately.
-   **Interfaces over Classes:** Program to interfaces whenever possible to promote low coupling.
-   **Dependency Injection:** Prefer dependency injection over creating instances of dependencies directly within a class.
