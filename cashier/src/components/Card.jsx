import React from 'react';

export default function ProductCard({ product, onAddToCart }) {
  const finalPrice = product.price - product.price * product.discount;
  const hasDiscount = product.discount > 0;

  return (
    <div
      onClick={() => onAddToCart(product)}
      className="relative w-full bg-neutral rounded-2xl overflow-hidden cursor-pointer group hover:ring-2 hover:ring-primary active:scale-95 transition-all"
    >
      {/* Image Section */}
      <div className="relative aspect-square overflow-hidden bg-accent">
        <img
          src={product.image}
          alt={product.name}
          className="object-cover w-full h-full transition-transform group-hover:scale-110 duration-300"
        />
      </div>

      {/* Info Section with Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-accent from-primary to-primary/90 p-3 sm:p-4">
        <h3 className="font-bold text-white text-base sm:text-lg mb-1 truncate">{product.name}</h3>
        <p className="text-white/90 text-xs sm:text-sm mb-2 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="font-bold text-error text-lg sm:text-xl">
            {finalPrice.toLocaleString()}som
          </span>
          {hasDiscount && (
            <span className="bg-error text-white px-2 py-1 rounded-lg text-[10px] sm:text-xs font-bold">
              -{(product.discount * 100).toFixed(0)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}