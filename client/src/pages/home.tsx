import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Glasses, CalendarCheck, ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white px-6 py-20 sm:px-12 sm:py-28 shadow-2xl">
        <div className="absolute inset-0 z-0 opacity-40">
           {/* Replace with a real medical/optical image if available, using abstract gradient for now */}
           <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-slate-900 to-black" />
           {/* Optional: Add Unsplash image here with comment */}
           {/* <!-- Abstract optical background: https://unsplash.com/photos/blue-and-black-abstract-painting-4-4W0X-4-4 --> */}
        </div>
        
        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-4xl sm:text-6xl font-bold leading-tight mb-4">
              See the World with <span className="text-primary">Clarity</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-lg mx-auto">
              Premium eye care, designer frames, and advanced diagnostics in the heart of Chile.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/appointments">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 h-12 text-base shadow-lg shadow-primary/25">
                Book Appointment <CalendarCheck className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/shop">
              <Button size="lg" variant="outline" className="text-primary border-primary/20 hover:bg-primary/10 rounded-full px-8 h-12 text-base">
                Shop Frames <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            icon: <Glasses className="w-8 h-8 text-primary" />,
            title: "Designer Eyewear",
            desc: "Curated collection of top international and local brands."
          },
          {
            icon: <ShieldCheck className="w-8 h-8 text-primary" />,
            title: "Clinical Excellence",
            desc: "Advanced diagnostic technology and experienced ophthalmologists."
          },
          {
            icon: <ShoppingBag className="w-8 h-8 text-primary" />,
            title: "Easy Ordering",
            desc: "Order contacts and glasses online with fast home delivery."
          }
        ].map((feature, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="w-14 h-14 rounded-xl bg-primary/5 flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
            <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* CTA Section */}
      <section className="bg-secondary/50 rounded-3xl p-12 text-center">
        <h2 className="text-3xl font-bold mb-4 font-display">Ready for better vision?</h2>
        <p className="text-slate-600 mb-8 max-w-xl mx-auto">
          Join thousands of satisfied patients who trust VistaChile for their eye health.
        </p>
        <Link href="/api/login">
          <Button size="lg" className="bg-slate-900 text-white hover:bg-slate-800">
            Create Account
          </Button>
        </Link>
      </section>
    </div>
  );
}
