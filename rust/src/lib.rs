
use clipboard_rs::{Clipboard, ClipboardContext};
use core_graphics::event::{CGEvent, CGEventFlags, CGKeyCode, CGEventTapLocation, CGEventPost};
use cocoa::base::{nil, id};
use objc::runtime::{Class, Object, Sel, sel, sel_impl};
use qrcode::QrCode;
use image::{Luma, ImageOutputFormat};
use std::io::Cursor;

uniffi::include_scaffolding!("rust");

fn generate_qr_code(data: String) -> Vec<u8> {
    let code = QrCode::new(data.as_bytes()).unwrap();
    let image = code.render::<Luma<u8>>().build();
    let mut buffer = Cursor::new(Vec::new());
    image.write_to(&mut buffer, ImageOutputFormat::Png).unwrap();
    buffer.into_inner()
}

#[allow(deprecated)]
fn insert_to_frontmost_app(content: String) {
    unsafe {
        let workspace = Class::get("NSWorkspace").unwrap();
        let shared_workspace: id = msg_send![workspace, sharedWorkspace];
        let frontmost_app: id = msg_send![shared_workspace, frontmostApplication];
        let pid: i32 = msg_send![frontmost_app, processIdentifier];

        let app = AXUIElementCreateApplication(pid);
        let mut focused_element: id = nil;

        let result = AXUIElementCopyAttributeValue(
            app,
            "kAXFocusedUIElementAttribute" as CFStringRef,
            &mut focused_element as *mut _ as *mut *const std::ffi::c_void,
        );

        if result == 0 {
            let _ = AXUIElementSetAttributeValue(
                focused_element,
                "kAXValueAttribute" as CFStringRef,
                content.as_ptr() as id,
            );
        }
    }
}

fn paste_to_frontmost_app(content: String) {
    let mut ctx = ClipboardContext::new().unwrap();
    ctx.set_text(content.to_string()).unwrap();

    let event_source = CGEvent::new_event_source(core_graphics::sys::kCGEventSourceStateHIDSystemState).unwrap();

    let key_v = 0x09;
    let key_command = 0x37;

    let key_down_v = CGEvent::new_keyboard_event(event_source.clone(), key_v as CGKeyCode, true).unwrap();
    let key_up_v = CGEvent::new_keyboard_event(event_source.clone(), key_v as CGKeyCode, false).unwrap();

    let mut key_down_command = CGEvent::new_keyboard_event(event_source.clone(), key_command as CGKeyCode, true).unwrap();
    let key_up_command = CGEvent::new_keyboard_event(event_source, key_command as CGKeyCode, false).unwrap();

    key_down_command.set_flags(CGEventFlags::CGEventFlagCommand);
    key_down_v.set_flags(CGEventFlags::CGEventFlagCommand);

    let tap_location = CGEventTapLocation::HID;
    key_down_command.post(tap_location);
    key_down_v.post(tap_location);
    key_up_v.post(tap_location);
    key_up_command.post(tap_location);
}

extern "C" {
    fn AXUIElementCreateApplication(pid: i32) -> id;
    fn AXUIElementCopyAttributeValue(
        element: id,
        attribute: CFStringRef,
        value: *mut *const std::ffi::c_void,
    ) -> i32;
    fn AXUIElementSetAttributeValue(element: id, attribute: CFStringRef, value: id) -> i32;
    type CFStringRef;
}
