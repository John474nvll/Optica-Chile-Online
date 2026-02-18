import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, CheckCircle, Clock, ShieldCheck, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 md:pt-32 md:pb-48 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent z-0"></div>
        
        <div className="container mx-auto px-4 relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-5xl md:text-7xl font-bold font-display text-foreground leading-[1.1]"
            >
              See the world with <span className="text-primary">clarity</span>.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-lg"
            >
              Expert eye care and premium eyewear tailored to your unique style and vision needs.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap gap-4 pt-4"
            >
              <Link href="/shop">
                <Button size="lg" className="rounded-full px-8 text-lg h-14 shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                  Shop Frames <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/appointments">
                <Button variant="outline" size="lg" className="rounded-full px-8 text-lg h-14 border-2 hover:bg-muted">
                  Book Exam
                </Button>
              </Link>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl shadow-primary/10">
              {/* Unsplash image: Professional optician checking glasses */}
              <img 
                src="https://images.unsplash.com/photo-1570222094114-28a9d88a27e6?w=1200&q=80" 
                alt="Optical professional" 
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <p className="font-bold text-lg">Premium Care</p>
                <p className="text-sm opacity-90">Certified Professionals</p>
              </div>
            </div>
            
            {/* Floating Card */}
            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-card p-6 rounded-2xl shadow-xl border border-border/50 max-w-xs hidden md:block">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-green-100 p-2 rounded-full">
                  <Star className="w-5 h-5 text-green-600 fill-green-600" />
                </div>
                <div>
                  <p className="font-bold text-foreground">4.9/5 Rating</p>
                  <p className="text-xs text-muted-foreground">Based on 1200+ reviews</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: CheckCircle, title: "Precision Optics", desc: "Advanced lens technology for perfect clarity." },
            { icon: Clock, title: "Quick Turnaround", desc: "Most glasses ready in 24-48 hours." },
            { icon: ShieldCheck, title: "Satisfaction Guaranteed", desc: "30-day money back guarantee on all frames." },
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card p-8 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all"
            >
              <div className="bg-primary/5 w-14 h-14 rounded-xl flex items-center justify-center mb-6 text-primary">
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Collection Preview */}
      <section className="container mx-auto px-4 py-16 bg-muted/30 rounded-3xl">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-4xl font-display font-bold mb-4">Trending Styles</h2>
          <p className="text-muted-foreground">Discover our most popular frames selected by style experts.</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
             <div key={i} className="group bg-background rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-border/50">
               <div className="aspect-square bg-gray-100 relative overflow-hidden">
                 {/* Unsplash: stylish glasses */}
                 <img 
                   src={`https://images.unsplash.com/photo-${i === 1 ? '1577803645773-f96470509666' : i === 2 ? '1511499767150-a48a237f0083' : i === 3 ? '1591076482161-42ce6da69f67' : '1508296695146-25e7b52a2669'}?w=500&q=80`} 
                   alt="Glasses" 
                   className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                 />
               </div>
               <div className="p-4">
                 <h3 className="font-bold text-lg">Classic Wayfarer</h3>
                 <p className="text-primary font-medium mt-1">$129.00</p>
               </div>
             </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link href="/shop">
            <Button variant="outline" size="lg" className="rounded-full">View All Collection</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
