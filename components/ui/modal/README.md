# Modal Component System

A fully reusable, accessible modal component with backdrop blur that covers the entire screen including the sidebar.

## Features

- ✅ **Centered in viewport** - Modal is perfectly centered on the entire screen
- ✅ **Full backdrop blur** - Blurs everything including the sidebar
- ✅ **Accessible** - Proper ARIA attributes and keyboard navigation
- ✅ **Flexible sizing** - Multiple size options from sm to 4xl
- ✅ **Dark mode support** - Works seamlessly with light/dark themes
- ✅ **Structured components** - ModalHeader, ModalBody, ModalFooter for clean organization
- ✅ **Customizable** - Optional close button, backdrop click, escape key handling

## Basic Usage

```tsx
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import Button from "@/components/ui/button/Button";

function MyComponent() {
  const { isOpen, openModal, closeModal } = useModal();

  return (
    <>
      <Button onClick={openModal}>Open Modal</Button>

      <Modal isOpen={isOpen} onClose={closeModal}>
        <ModalHeader>Modal Title</ModalHeader>
        
        <ModalBody>
          <p>Your modal content goes here...</p>
        </ModalBody>
        
        <ModalFooter>
          <Button variant="outline" onClick={closeModal}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
```

## Props

### Modal Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | required | Controls modal visibility |
| `onClose` | `() => void` | required | Callback when modal should close |
| `children` | `ReactNode` | required | Modal content |
| `size` | `"sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| "4xl" \| "full"` | `"lg"` | Modal width |
| `className` | `string` | `""` | Additional CSS classes |
| `closeOnBackdrop` | `boolean` | `true` | Close when clicking backdrop |
| `closeOnEscape` | `boolean` | `true` | Close when pressing Escape |
| `showCloseButton` | `boolean` | `true` | Show X button in top right |

### ModalHeader Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Header content (auto-styled if string) |
| `className` | `string` | `""` | Additional CSS classes |

### ModalBody Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Body content (scrollable) |
| `className` | `string` | `""` | Additional CSS classes |

### ModalFooter Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Footer content (typically buttons) |
| `className` | `string` | `""` | Additional CSS classes |

## Examples

### Small Modal

```tsx
<Modal isOpen={isOpen} onClose={closeModal} size="sm">
  <ModalHeader>Confirm Action</ModalHeader>
  <ModalBody>
    <p>Are you sure you want to proceed?</p>
  </ModalBody>
  <ModalFooter>
    <Button variant="outline" onClick={closeModal}>No</Button>
    <Button onClick={handleConfirm}>Yes</Button>
  </ModalFooter>
</Modal>
```

### Large Modal with Form

```tsx
<Modal isOpen={isOpen} onClose={closeModal} size="3xl">
  <ModalHeader>Create New User</ModalHeader>
  
  <ModalBody>
    <Form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <Input label="Name" />
        <Input label="Email" type="email" />
        <Input label="Phone" type="tel" />
      </div>
    </Form>
  </ModalBody>
  
  <ModalFooter>
    <Button variant="outline" onClick={closeModal}>Cancel</Button>
    <Button type="submit" onClick={handleSubmit}>Create</Button>
  </ModalFooter>
</Modal>
```

### Modal Without Close Button

```tsx
<Modal 
  isOpen={isOpen} 
  onClose={closeModal}
  showCloseButton={false}
  closeOnBackdrop={false}
  closeOnEscape={false}
>
  <ModalHeader>Processing...</ModalHeader>
  <ModalBody>
    <p>Please wait while we process your request.</p>
  </ModalBody>
</Modal>
```

### Custom Styled Modal

```tsx
<Modal 
  isOpen={isOpen} 
  onClose={closeModal}
  size="2xl"
  className="border-2 border-blue-500"
>
  <ModalHeader className="bg-blue-500 text-white">
    <h2 className="text-2xl">Custom Header</h2>
  </ModalHeader>
  
  <ModalBody className="bg-gray-50 dark:bg-gray-800">
    <p>Custom styled content...</p>
  </ModalBody>
  
  <ModalFooter className="bg-gray-100 dark:bg-gray-800">
    <Button>Action</Button>
  </ModalFooter>
</Modal>
```

## Migration from Old Modal

If you're using the old modal format with inline styling:

**Before:**
```tsx
<div className="fixed inset-0 lg:left-[90px] z-[9999]...">
  <div className="bg-white dark:bg-gray-900...">
    <div className="header...">...</div>
    <div className="body...">...</div>
    <div className="footer...">...</div>
  </div>
</div>
```

**After:**
```tsx
<Modal isOpen={isOpen} onClose={closeModal} size="3xl">
  <ModalHeader>Title</ModalHeader>
  <ModalBody>Content</ModalBody>
  <ModalFooter>Actions</ModalFooter>
</Modal>
```

## Notes

- The modal automatically prevents body scrolling when open
- The backdrop blur covers the ENTIRE screen including the sidebar
- Modal is centered in the full viewport, not offset by the sidebar
- Escape key handling and click-outside-to-close are built-in
- All components are fully dark mode compatible

