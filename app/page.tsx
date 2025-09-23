"use client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SignUp() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const router =  useRouter()

  useEffect(() => {
    const username = localStorage.getItem("username")
    const password = localStorage.getItem("password")
    if (username == process.env.NEXT_PUBLIC_USERNAME  && password == process.env.NEXT_PUBLIC_PASSWORD) {
      redirect("/home")
    }
  }, [])

  const handleSubmit = () => {
    if (!username || !password) {
      alert("username and password is required.")
      return
    }
    localStorage.setItem("username", username)
    localStorage.setItem("password", password )
    if (username === process.env.NEXT_PUBLIC_USERNAME && password === process.env.NEXT_PUBLIC_PASSWORD) {
      alert("Login successfull.")
      redirect("/home")
    } else {
      alert("Username or Password is incorrect.")
    }
  }

  return ( 
    <main className="flex justify-center items-center min-h-screen px-4">
      <section className="max-w-7xl flex flex-col gap-4 bg-blue-300 p-6 rounded-xl">
      <h1 className="text-white font-semibold">Login to TalentFlow</h1>
      <form className="flex flex-col gap-4">
      <Input value={username} placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
      <Input value={password} placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        <Button onClick={handleSubmit}>Login</Button>
      </form>
      </section>
    </main>
  );
}
