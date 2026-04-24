import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { useAppData } from "../contexts/AppDataContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import {
  buildGmailTripPlanLink,
  describeWeatherCode,
  fetchDestinationWeather,
  generatePackingList,
  generateTripSuggestions,
} from "../lib/travelTools";

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
}

const faqItems = [
  {
    question: "How do I create a trip?",
    answer:
      "Open your dashboard, fill in the trip name, destination, dates, and basic details, then save it. WanderPack will create the trip and add you as the trip admin.",
  },
  {
    question: "How do I invite members?",
    answer:
      "Open a trip and use the member invite option. Enter the traveler email and WanderPack will add them to the trip as pending until they join the plan.",
  },
  {
    question: "How does the packing list work?",
    answer:
      "The packing list is generated from your selected trip and destination weather. You can review the suggested items and save them directly into the trip.",
  },
  {
    question: "Where do I see notifications?",
    answer:
      "Traveler notifications appear in the Notifications page and in the small notification strip inside the main app when recent updates are available.",
  },
  {
    question: "How can I send the trip plan by email?",
    answer:
      "Use the Gmail Trip Plan section to open a prefilled Gmail draft for the selected trip. It prepares a message you can send to your trip members quickly.",
  },
];

function makeAssistantReply(message: string, destination: string) {
  const text = message.toLowerCase();
  if (text.includes("budget")) {
    return `Start with stay, transfers, and one anchor activity for ${destination || "your trip"}, then leave 15-20% unassigned for food and last-minute changes.`;
  }
  if (text.includes("packing")) {
    return `Keep your packing list focused on documents, chargers, weather layers, and one flexible day bag. I can also generate a destination-specific list below.`;
  }
  if (text.includes("weather")) {
    return `Use the live weather card below to check current conditions, then adjust clothes and transport choices before locking the itinerary.`;
  }
  return `For ${destination || "your next destination"}, I'd suggest locking the stay, airport transfer, and first-day plan before polishing activities.`;
}

export function AssistantPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { state, memberTrips, updateTrip } = useAppData();
  const { showToast } = useToast();
  const [selectedTripId, setSelectedTripId] = useState<string>(() => memberTrips[0]?.id || "");
  const [destinationQuery, setDestinationQuery] = useState(() => memberTrips[0]?.destination || "Bali");
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherInfo, setWeatherInfo] = useState<{
    destinationLabel: string;
    temperature: number;
    windspeed: number;
    weatherCode: number;
  } | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "assistant-1",
      role: "assistant",
      text: "Ask me about trip planning, budget pacing, packing, or itinerary ideas. I'll keep it simple and practical.",
    },
  ]);

  const selectedTrip = useMemo(
    () => memberTrips.find((trip) => trip.id === selectedTripId) || memberTrips[0] || null,
    [memberTrips, selectedTripId],
  );

  const suggestionCards = useMemo(
    () => generateTripSuggestions(destinationQuery, [selectedTrip?.category || "", selectedTrip?.vibe || ""]),
    [destinationQuery, selectedTrip],
  );

  const generatedPackingList = useMemo(
    () => (selectedTrip ? generatePackingList(selectedTrip, describeWeatherCode(weatherInfo?.weatherCode)) : []),
    [selectedTrip, weatherInfo?.weatherCode],
  );

  // FIXED: Updated useEffect to properly sync when selectedTrip changes
  useEffect(() => {
    if (!selectedTrip) return;
    // Only update if the selectedTripId matches the current selectedTrip
    if (selectedTrip.id !== selectedTripId) {
      setSelectedTripId(selectedTrip.id);
    }
    setDestinationQuery(selectedTrip.destination);
  }, [selectedTrip, selectedTripId]); // Added selectedTripId to dependencies

  // FIXED: Handle case when memberTrips changes (e.g., after joining a new trip)
  useEffect(() => {
    if (memberTrips.length > 0 && !selectedTripId) {
      setSelectedTripId(memberTrips[0].id);
      setDestinationQuery(memberTrips[0].destination);
    }
  }, [memberTrips, selectedTripId]);

  async function handleFetchWeather(destination: string) {
    setWeatherLoading(true);
    try {
      const result = await fetchDestinationWeather(destination);
      setWeatherInfo(result);
      if (!result) {
        showToast("Weather could not be loaded for that destination.");
      }
    } catch (error) {
      showToast("Failed to fetch weather data.");
      setWeatherInfo(null);
    } finally {
      setWeatherLoading(false);
    }
  }

  async function handleApplyPackingList() {
    if (!selectedTrip || !generatedPackingList.length) return;
    try {
      await updateTrip(selectedTrip.id, { packingList: generatedPackingList });
      showToast("Packing list saved to trip.");
    } catch (error) {
      showToast("Failed to save packing list.");
    }
  }

  function handleSendChat() {
    if (!chatInput.trim()) return;
    const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: "user", text: chatInput.trim() };
    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now() + 1}`,
      role: "assistant",
      text: makeAssistantReply(chatInput.trim(), destinationQuery),
    };
    setMessages((current) => [...current, userMessage, assistantMessage]);
    setChatInput("");
  }

  // FIXED: Added better debugging for dropdown
  const handleTripChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newTripId = event.target.value;
    setSelectedTripId(newTripId);
    const newTrip = memberTrips.find(trip => trip.id === newTripId);
    if (newTrip) {
      setDestinationQuery(newTrip.destination);
    }
  };

  return (
    <AppShell showAdminLink={profile?.role === "admin" || profile?.role === "superadmin"}>
      <section className="dashboard-header dashboard-grid">
        <div>
          <span className="eyebrow-pill">Travel FAQ</span>
          <h1>Find quick answers for common traveler questions</h1>
          <p className="text-muted">
            Use this FAQ hub for weather help, packing guidance, trip suggestions, and Gmail-ready trip plan messages.
          </p>
        </div>
        <div className="panel-card dashboard-summary">
          <h2 className="section-title">Trip Focus</h2>
          {/* FIXED: Simplified dropdown with proper event handling */}
          {memberTrips.length > 0 ? (
            <>
              <select
                className="form-control"
                value={selectedTripId}
                onChange={handleTripChange}
                aria-label="Select a trip"
              >
                {memberTrips.map((trip) => (
                  <option value={trip.id} key={trip.id}>
                    {trip.name} {trip.destination ? `- ${trip.destination}` : ''}
                  </option>
                ))}
              </select>
              {selectedTrip ? (
                <div className="simple-grid">
                  <div className="metric-box">
                    <strong>{selectedTrip.members.length}</strong>
                    <span>members</span>
                  </div>
                  <div className="metric-box">
                    <strong>{selectedTrip.progress || 0}%</strong>
                    <span>trip ready</span>
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <div className="empty-state">
              No trips found. Create or join a trip first.
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate('/dashboard')}
                style={{ marginTop: '10px' }}
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="split-panel">
        <div className="panel-card">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div className="chat-thread">
            {faqItems.map((item) => (
              <div className="chat-bubble assistant" key={item.question}>
                <strong>{item.question}</strong>
                <p>{item.answer}</p>
              </div>
            ))}
          </div>
          <div className="inline-form">
            <input
              className="form-control"
              placeholder="Type a question like packing, budget, or itinerary help"
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendChat();
                }
              }}
            />
            <button className="btn btn-primary btn-sm" onClick={handleSendChat} type="button">
              Ask FAQ
            </button>
          </div>
        </div>

        <div className="stack">
          <section className="panel-card">
            <h2 className="section-title">Live Weather</h2>
            <div className="inline-form">
              <input
                className="form-control"
                value={destinationQuery}
                onChange={(event) => setDestinationQuery(event.target.value)}
                placeholder="Destination"
              />
              <button
                className="btn btn-outline btn-sm"
                onClick={() => void handleFetchWeather(destinationQuery)}
                type="button"
                disabled={weatherLoading || !destinationQuery}
              >
                {weatherLoading ? "Loading..." : "Refresh"}
              </button>
            </div>
            {weatherInfo ? (
              <div className="simple-grid">
                <div className="metric-box">
                  <strong>{Math.round(weatherInfo.temperature)}°C</strong>
                  <span>{weatherInfo.destinationLabel}</span>
                </div>
                <div className="metric-box">
                  <strong>{Math.round(weatherInfo.windspeed)} km/h</strong>
                  <span>{describeWeatherCode(weatherInfo.weatherCode)}</span>
                </div>
              </div>
            ) : (
              <div className="empty-state">Load a destination to see current weather conditions.</div>
            )}
          </section>

          <section className="panel-card">
            <h2 className="section-title">Packing List Generator</h2>
            <div className="tag-row">
              {generatedPackingList.length > 0 ? (
                generatedPackingList.map((item) => (
                  <span className="tag" key={item}>
                    {item}
                  </span>
                ))
              ) : (
                <span className="text-muted">Select a destination and load weather to generate packing list</span>
              )}
            </div>
            <div className="tag-row">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => void handleApplyPackingList()}
                type="button"
                disabled={!selectedTrip || generatedPackingList.length === 0}
              >
                Save To Trip
              </button>
              {selectedTrip ? (
                <button className="btn btn-outline btn-sm" onClick={() => navigate(`/trip?id=${selectedTrip.id}`)} type="button">
                  Open Trip
                </button>
              ) : null}
            </div>
          </section>
        </div>
      </section>

      <section className="two-column-grid dashboard-columns">
        <div className="panel-card">
          <h2 className="section-title">Trip Suggestions</h2>
          <div className="subtle-list">
            {suggestionCards.map((suggestion) => (
              <div className="subtle-item" key={suggestion.title}>
                <strong>{suggestion.title}</strong>
                <p className="text-muted">{suggestion.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="panel-card">
          <h2 className="section-title">Gmail Trip Plan</h2>
          {selectedTrip ? (
            <>
              <p className="text-muted">
                Open a prefilled Gmail compose window for the current trip so members can receive the final plan quickly.
              </p>
              <div className="tag-row">
                <span className="tag">{selectedTrip.members.filter((member) => member.role !== "pending").length} recipients</span>
                <span className="tag">{selectedTrip.destination}</span>
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  window.open(buildGmailTripPlanLink(selectedTrip), "_blank", "noopener,noreferrer");
                  showToast("Gmail compose opened.");
                }}
                type="button"
              >
                Send Plan With Gmail
              </button>
            </>
          ) : (
            <div className="empty-state">Create or join a trip to send a plan email.</div>
          )}
        </div>
      </section>
    </AppShell>
  );
}