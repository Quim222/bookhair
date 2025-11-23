"use client";

import React, { useEffect, useState } from "react";
import { EmployeeUser } from "./AboutTeam";
import { getUserUrl } from "../getUserUrl";
import { FaFacebook, FaInstagram } from "react-icons/fa";

export default function CardUserMainPage({ data }: { data: EmployeeUser }) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    getUserUrl(data.id).then(
      result => {
        if (result.hasPhoto) setPhotoUrl(result.url ?? null);
        else setPhotoUrl(null);
      }
    ).catch(console.error);
  }, [data.id]);

  return (
    <div className="bg-white/70 dark:bg-zinc-900/60 cursor-pointer 
    rounded-xl shadow-md p-6 flex flex-col items-center text-center hover:scale-105 
    transition-transform duration-300 hover:border hover:border-gold/50
    w-[320px] md:w-[340px] shrink-0 dark:hover:bg-gradient-to-b hover:shadow-2xl
    dark:shadow-gold-dark dark:shadow-[0_2px_10px] dark:hover:shadow-md">
      <div className="flex flex-col items-center justify-center">
        {photoUrl && (
          <img
            src={photoUrl}
            alt="Foto de utilizador"
            className="w-60 h-30 md:w-40 md:h-30 rounded-2xl object-cover dark:border-2 dark:border-white"
          />
        )}
        <div className="flex flex-col mt-4 items-center justify-center gap-6">
          <h2 className="font-bold dark:text-white">{data.name}</h2>
          <div className="flex gap-4 items-center">
            <FaInstagram className="text-gray-600 dark:text-gray-300 w-8 h-8" />
            <FaFacebook className="text-gray-600 dark:text-gray-300 w-8 h-8" />
          </div>
        </div>
      </div>
    </div>
  );
}
