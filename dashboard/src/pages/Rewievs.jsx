import React, { useEffect, useState } from "react";
import { Star, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const ReviewsDashboard = () => {
  const [filterPeriod] = useState("17 April 2020 - 21 May 2020");
  const [loading, setLoading] = useState(true);

  const featuredReviews = [
    {
      id: 1,
      dish: "Chicken Curry Special withCucumber",
      category: "MAIN COURSE",
      image:
        "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=400&fit=crop",
      review:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      reviewer: "Roberto Jr.",
      role: "Graphic Design",
      avatar: "https://i.pravatar.cc/150?img=12",
      rating: 4.5,
    },
    {
      id: 2,
      dish: "Spaghetti Special with Barbeque",
      category: "MAIN COURSE",
      image:
        "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop",
      review:
        "Fast, professional and friendly service, every dish was spectacular!",
      reviewer: "Lord Ned Stark",
      role: "UX Designer",
      avatar: "https://i.pravatar.cc/150?img=33",
      rating: 4.5,
    },
    {
      id: 3,
      dish: "Pizza Mozarella with Spicy Cream",
      category: "MAIN COURSE",
      image:
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=400&fit=crop",
      review:
        "Fast, professional and friendly service, every dish was spectacular!",
      reviewer: "Fredy Mercury",
      role: "Sr. Programmer",
      avatar: "https://i.pravatar.cc/150?img=15",
      rating: 4.5,
    },
  ];

  const otherReviews = [
    {
      id: 1,
      name: "James Kowalski",
      role: "Head Marketing",
      date: "24 June 2020",
      avatar: "https://i.pravatar.cc/150?img=60",
      tags: ["Good Services", "Good Places", "Excellent"],
      rating: 3.5,
      review:
        "We recently had dinner with friends and walked away with a great experience.",
    },
    {
      id: 2,
      name: "Jonathan Fringerman",
      role: "UX Designer",
      date: "24 June 2020",
      avatar: "https://i.pravatar.cc/150?img=13",
      tags: ["Good Services", "Excellent"],
      rating: 3.5,
      review:
        "We recently had dinner with friends and walked away with a great experience.",
    },
    {
      id: 3,
      name: "Trianto Lauw",
      role: "Graphic Designer",
      date: "24 June 2020",
      avatar: "https://i.pravatar.cc/150?img=68",
      tags: ["Delicious", "Good Services"],
      rating: 3.5,
      review:
        "We recently had dinner with friends and walked away with a great experience.",
    },
    {
      id: 4,
      name: "Verelyn Chong",
      role: "Quality Assurance",
      date: "24 June 2020",
      avatar: "https://i.pravatar.cc/150?img=47",
      tags: ["Good Services"],
      rating: 3.5,
      review:
        "We recently had dinner with friends and walked away with a great experience.",
    },
  ];

  const StarRating = ({ rating }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-4 h-4 ${
            s <= rating
              ? "fill-warning text-warning"
              : "fill-base-300 text-base-300"
          }`}
        />
      ))}
    </div>
  );

  const getTagClass = (tag) => {
    const map = {
      "Good Services": "badge-primary",
      "Good Places": "badge-success",
      Excellent: "badge-error",
      Delicious: "badge-warning",
    };
    return map[tag] || "badge-ghost";
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative">

      {/* Loading Overlay */}
      {loading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span className="loading loading-spinner text-success w-12"></span>
        </div>
      )}

      {/* Page Content — loading paytida ko'rinmaydi, tugagach smooth paydo bo'ladi */}
      <div
        style={{
          opacity: loading ? 0 : 1,
          transition: "opacity 0.4s ease",
          pointerEvents: loading ? "none" : "auto",
        }}
      >
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-base-content mb-2">Reviews</h1>
          <div className="flex justify-between items-center">
            <p className="text-sm text-base-content/60">
              <span className="text-primary font-semibold">Dashboard</span> /
              Customer Reviews
            </p>
            <div className="flex items-center gap-3 bg-base-100 px-4 py-2 rounded-lg shadow">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs font-semibold">Filter Period</p>
                <p className="text-xs text-base-content/60">{filterPeriod}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Featured */}
        <div className="flex gap-4 mb-4 overflow-x-auto pb-4">
          {featuredReviews.map((item) => (
            <div
              key={item.id}
              className="bg-base-100 rounded-xl shadow w-80 flex-shrink-0"
            >
              <div className="p-5 text-center">
                <div className="w-40 h-40 mx-auto mb-4 rounded-full overflow-hidden ring ring-base-300">
                  <img
                    src={item.image}
                    alt={item.dish}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold">{item.dish}</h3>
                <p className="text-xs text-primary font-bold mb-3">
                  {item.category}
                </p>
                <p className="text-xs text-base-content/70 mb-4">
                  {item.review}
                </p>
                <div className="bg-neutral rounded-lg p-3 flex justify-between items-center">
                  <div className="flex gap-2 items-center">
                    <img
                      src={item.avatar}
                      alt={item.reviewer}
                      className="w-10 h-10 rounded-full ring ring-base-100"
                    />
                    <div className="text-left">
                      <p className="text-base-100 font-semibold text-sm">
                        {item.reviewer}
                      </p>
                      <p className="text-base-300 text-xs">{item.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 items-center">
                    <Star className="w-5 h-5 fill-warning text-warning" />
                    <span className="text-base-100 font-bold">{item.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Arrows */}
        <div className="flex justify-end gap-2 mb-6">
          <button className="btn btn-circle btn-primary btn-sm">
            <ChevronLeft />
          </button>
          <button className="btn btn-circle btn-primary btn-sm">
            <ChevronRight />
          </button>
        </div>

        {/* Other reviews */}
        <div className="bg-base-100 rounded-xl shadow p-6">
          <div className="flex justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold">Others review</h2>
              <p className="text-xs text-base-content/60">
                Customer reviews about your restaurant
              </p>
            </div>
            <select className="select select-sm select-primary">
              <option>Latest</option>
              <option>Oldest</option>
              <option>Highest Rating</option>
              <option>Lowest Rating</option>
            </select>
          </div>

          <div className="space-y-5">
            {otherReviews.map((r, i) => (
              <div
                key={r.id}
                className={`pb-5 ${
                  i !== otherReviews.length - 1
                    ? "border-b border-base-300"
                    : ""
                }`}
              >
                <div className="flex justify-between gap-4">
                  <div className="flex gap-3 flex-1">
                    <img
                      src={r.avatar}
                      alt={r.name}
                      className="w-12 h-12 rounded-full ring ring-base-300"
                    />
                    <div>
                      <h3 className="font-bold text-sm">{r.name}</h3>
                      <p className="text-xs text-base-content/60">
                        {r.role} • {r.date}
                      </p>
                      <div className="flex gap-2 flex-wrap my-3">
                        {r.tags.map((t, idx) => (
                          <span key={idx} className={`badge ${getTagClass(t)}`}>
                            {t}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-base-content/80">{r.review}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold">{r.rating}</span>
                    <StarRating rating={r.rating} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewsDashboard;