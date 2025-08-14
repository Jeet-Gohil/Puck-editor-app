"use client";

import { Puck } from "@measured/puck";
import "@measured/puck/puck.css";

// Minimal test component
const TestComponent = ({ text }: { text: string }) => {
  return <div>{text}</div>;
};

// Minimal config for testing
const testConfig = {
  components: {
    TestComponent: {
      fields: {
        text: { type: "text", label: "Text" },
      },
      render: (props: any) => <TestComponent {...props} />,
    },
  },
};

export default function TestPage() {
  const initialData = {
    content: [
      {
        type: "TestComponent",
        props: {
          id: "test-1",
          text: "Hello World",
        },
      },
    ],
    root: { props: { title: "Test Page" } },
  };

  return (
    <div suppressHydrationWarning>
      <Puck
        config={testConfig}
        data={initialData}
      />
    </div>
  );
}
