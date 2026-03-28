import React, { useEffect, useRef, useState } from "react";
import { Star, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "https://sedap-nnap.onrender.com/api";

const ReviewsDashboard = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const carouselRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [featuredReviews, setFeaturedReviews] = useState([]);
  const [otherReviews, setOtherReviews] = useState([]);

  const filterPeriod =
    from && to
      ? `${from} → ${to}`
      : from
      ? `From ${from}`
      : to
      ? `Until ${to}`
      : "All time";

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
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const qs = params.toString();
    fetch(`${API}/reviews${qs ? `?${qs}` : ""}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const all = Array.isArray(data) ? data : [];
        const featured = all
          .filter((r) => r.isFeatured)
          .map((r) => ({
            id: r.id,
            dish: r.productName,
            category: r.productCategory,
            image: r.productImage,
            review: r.review,
            reviewer: r.reviewer,
            role: r.reviewerRole,
            avatar: r.reviewerAvatar,
            rating: r.rating,
          }));
        const others = all
          .filter((r) => !r.isFeatured)
          .map((r) => ({
            id: r.id,
            name: r.reviewer,
            role: r.reviewerRole,
            avatar: r.reviewerAvatar,
            tags: Array.isArray(r.tags) ? r.tags : [],
            rating: r.rating,
            review: r.review,
          }));
        setFeaturedReviews(featured);
        setOtherReviews(others);
      })
      .catch(() => {
        if (!cancelled) {
          setFeaturedReviews([]);
          setOtherReviews([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [from, to]);

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
            <div className="relative">
              <button
                onClick={() => setShowDatePicker((v) => !v)}
                className="flex items-center gap-3 bg-base-100 px-4 py-2 rounded-lg shadow hover:shadow-md transition"
              >
                <Calendar className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <p className="text-xs font-semibold">Filter Period</p>
                  <p className="text-xs text-base-content/60">{filterPeriod}</p>
                </div>
              </button>
              {showDatePicker && (
                <div className="absolute right-0 top-12 z-50 bg-base-100 shadow-xl rounded-xl p-4 flex flex-col gap-3 w-64">
                  <div>
                    <label className="text-xs font-semibold text-base-content/60 block mb-1">From</label>
                    <input
                      type="date"
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      className="input input-bordered input-sm w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-base-content/60 block mb-1">To</label>
                    <input
                      type="date"
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      className="input input-bordered input-sm w-full"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => { setFrom(""); setTo(""); }}
                      className="btn btn-ghost btn-xs"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => setShowDatePicker(false)}
                      className="btn btn-primary btn-xs"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Featured */}
        <div ref={carouselRef} className="flex gap-4 mb-4 overflow-x-auto pb-4 scroll-smooth"
          style={{ scrollbarWidth: "none" }}>
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
          <button
            onClick={() => carouselRef.current?.scrollBy({ left: -320, behavior: "smooth" })}
            className="btn btn-circle btn-primary btn-sm"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={() => carouselRef.current?.scrollBy({ left: 320, behavior: "smooth" })}
            className="btn btn-circle btn-primary btn-sm"
          >
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