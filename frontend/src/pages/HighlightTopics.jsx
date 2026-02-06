import { useState } from "react";

const sampleContent = {
  "Chapter 1": {
    "Introduction to IOE Devices":
      "IOE (Internet of Everything) devices are interconnected physical objects that collect, exchange, and process data over the internet. These devices play a crucial role in modern smart systems including smart homes, healthcare, and industrial automation.",
    "Types of IOE Devices":
      "IOE devices can be classified into sensors, actuators, controllers, and smart devices. Sensors collect data, actuators act upon it, controllers process decisions, and smart devices combine all functionalities.",
  },
  "Chapter 2": {
    "Communication Protocols":
      "Communication protocols define how IOE devices exchange data. Common protocols include MQTT, CoAP, HTTP, and AMQP.",
    "Network Architecture":
      "IOE network architecture typically follows layered models including perception, transport, processing, and application layers.",
  },
  "Chapter 3": {
    "Security Challenges":
      "Security in IOE involves protecting devices from unauthorized access, data breaches, and malware attacks.",
  },
  "Chapter 4": {
    "Cloud Integration":
      "Cloud platforms enable scalable storage, processing, and analytics for IOE-generated data.",
  },
  "Chapter 5": {
    "Edge Computing":
      "Edge computing reduces latency by processing data closer to the device instead of centralized cloud servers.",
  },
  "Chapter 6": {
    "Future Trends":
      "Future IOE trends include AI-powered devices, autonomous systems, and large-scale smart city deployments.",
  },
};

export default function HighlightTopics() {
  const [selectedTopic, setSelectedTopic] = useState({
    title: "Select a topic",
    content: "Click on any topic from the left to view important exam-focused theory here.",
  });

  return (
    <div className="h-screen w-full bg-zinc-950 text-white flex">

      {/* Left Pane – Book Contents */}
      <aside className="w-[28%] border-r border-zinc-800 p-6 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4 text-purple-400">
          📖 Contents
        </h2>

        <div className="space-y-4 text-sm">
          {Object.entries(sampleContent).map(([chapter, topics]) => (
            <div key={chapter}>
              <p className="text-zinc-400 font-medium mb-2">{chapter}</p>
              <div className="ml-4 space-y-1">
                {Object.keys(topics).map((topic) => (
                  <button
                    key={topic}
                    onClick={() =>
                      setSelectedTopic({
                        title: topic,
                        content: topics[topic],
                      })
                    }
                    className="block text-left w-full px-2 py-1 rounded-md hover:bg-zinc-800 transition"
                  >
                    • {topic}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Center Pane – Topic Content */}
      <main className="flex-1 p-10 flex flex-col">
        <h1 className="text-3xl font-bold mb-6 text-purple-300">
          {selectedTopic.title}
        </h1>

        <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-6 leading-relaxed text-zinc-200">
          {selectedTopic.content}
        </div>

        {/* Save Options */}
        <div className="mt-6 flex gap-4">
          <button className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition">
            💾 Save to Notes
          </button>

          <button className="px-4 py-2 rounded-lg border border-zinc-700 hover:bg-zinc-800 transition">
            📄 Export to Google Docs
          </button>
        </div>
      </main>
    </div>
  );
}
