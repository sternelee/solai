#!/bin/bash

# This script builds the Rust library for macOS and copies the
# necessary files to the Xcode project.

# Exit on error
set -e

# Build the Rust library for aarch64-apple-darwin
echo "Building Rust library for aarch64-apple-darwin..."
cd rust
cargo build --target aarch64-apple-darwin --release

# Create the destination directory if it doesn't exist
mkdir -p ../macos/sol-macOS/rust

# Copy the compiled library
echo "Copying compiled library..."
cp target/aarch64-apple-darwin/release/librust.a ../macos/sol-macOS/rust/

# Generate and copy the Swift bindings
echo "Generating and copying Swift bindings..."
cargo run --bin uniffi-bindgen generate src/rust.udl --language swift --out-dir generated
cp generated/rust.swift ../macos/sol-macOS/rust/
cp generated/rustFFI.h ../macos/sol-macOS/rust/
cp generated/rustFFI.modulemap ../macos/sol-macOS/rust/

echo "Done."
