# Rust Library

This directory contains the core logic for the application, written in Rust.

## Building for macOS

To build the Rust library for macOS, you will need to have the following installed:

*   Rust and Cargo
*   The `aarch64-apple-darwin` target for Rust
*   A C compiler that can target macOS (like clang)

Once you have the prerequisites, you can run the build script from the root of the project:

```bash
./scripts/build-rust-for-macos.sh
```

This will build the Rust library and copy the compiled library and Swift bindings to the `macos/sol-macOS/rust` directory.
