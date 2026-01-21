import React from "react";
import EventDetailsClient from "./EventDetailsClient";
import { getImageUrl } from "@/lib/utils";

// Define the API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://radar-ufvb.onrender.com/";

async function getEvent(eventId) {
  try {
    const res = await fetch(`${API_BASE_URL.replace(/\/$/, "")}/events/${eventId}/details/`, {
      next: { revalidate: 60 }, // Cache for 60 seconds
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Error fetching event for metadata:", error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const eventId = decodeURIComponent(params.event_id);
  const event = await getEvent(eventId);

  if (!event) {
    return {
      title: "Event Not Found | Axile",
      description: "Discover and book tickets for the hottest events.",
    };
  }

  const title = `${event.name} | Axile`;
  const description = event.description || "Discover and book tickets for the hottest events.";
  const imageUrl = getImageUrl(event.image);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: imageUrl ? [{ url: imageUrl }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function Page({ params }) {
  const eventId = decodeURIComponent(params.event_id);
  const initialEvent = await getEvent(eventId);

  return <EventDetailsClient event_id={eventId} initialEvent={initialEvent} />;
}
