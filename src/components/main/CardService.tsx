import React from "react";
import { Service } from "../getServices";

export default function CardService({ service }: { service: Service }) {
  return (
    <div className="relative max-w-xs w-full rounded-xl overflow-hidden hover:shadow-xl hover:scale-105 transition-transform duration-300 cursor-default">
      {/* imagem de fundo */}
      <img
        src={service.image ?? undefined}
        alt={service.name}
        className="w-full h-48 object-cover object-center"
      />

      {/* gradiente escuro para dar contraste ao texto */}
      <div className="absolute inset-0 bg-black/50 flex flex-col justify-end p-4">
        <h2 className="text-lg font-semibold text-white">{service.name}</h2>
        <p className="text-sm text-gray-200">{service.description}</p>
        <p className="text-sm text-gray-200">
          {service.duration} min • {service.price}€
        </p>
      </div>
    </div>
  );
}
