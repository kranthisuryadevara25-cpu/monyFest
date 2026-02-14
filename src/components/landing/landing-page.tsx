'use client';

import Link from 'next/link';
import * as React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Store, Users, TrendingUp, Shield, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MonyFestLogo, MonyFestWordmark } from '@/components/MonyFestLogo';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const fadeInUp = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { animate: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };
const fadeInUpView = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-30px' }, transition: { duration: 0.4 } };

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#for-business', label: 'For Merchants' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#faqs', label: 'FAQs' },
  { href: '#about', label: 'About' },
];

const FAQ_ITEMS = [
  {
    q: 'What is MonyFest?',
    a: 'MonyFest is a loyalty and rewards platform that connects members, merchants, and agents. Members earn points on purchases, redeem rewards, and refer others; merchants run offers and grow retention; agents build networks and earn commissions.',
  },
  {
    q: 'How do I earn loyalty points?',
    a: 'You earn points when you make purchases at participating merchants. Points can be based on your purchase value (slab-based) or on specific offers. As a member, you also get welcome points when you sign up. Referred members’ purchases can earn you a share of points too.',
  },
  {
    q: 'How can I redeem my points?',
    a: 'Go to the Rewards section in your member dashboard. You can redeem points for eligible offers, coupons, or rewards set by merchants and the platform. Your balance is shown on your homepage and wallet.',
  },
  {
    q: 'Is MonyFest free to join?',
    a: 'Yes. Signing up as a member is free. You can register with email or Google, choose your role (member, merchant, or agent), and start earning or offering rewards right away.',
  },
  {
    q: 'What is the referral program?',
    a: 'When you refer someone using your referral link or code, you can earn a share of the loyalty points from their purchases (e.g. parent and grandparent split). Referrers may also earn one-time signup commissions. This is a referral rewards program, not MLM.',
  },
  {
    q: 'How do slab-based rewards work?',
    a: 'Merchants or categories can set reward slabs by purchase amount (e.g. ₹100–199 → 10 points, ₹200+ → 25 points). Your points for a purchase are determined by the slab that matches the order value, so higher spends can earn more points.',
  },
  {
    q: 'Who can become a merchant?',
    a: 'Any business can apply to join as a merchant. After approval, you can create offers, set loyalty rules or slabs, track analytics, and run campaigns. Merchants can also join the Boost program for extra visibility and earnings.',
  },
  {
    q: 'What do agents do?',
    a: 'Agents onboard merchants and members in their territory. They earn commissions when referred members sign up and when they recruit new merchants. Agents have a dedicated dashboard for referrals, payouts, and performance.',
  },
  {
    q: 'Are my points and data secure?',
    a: 'We use secure authentication and store data with industry-standard practices. Your points balance and transaction history are tied to your account and can be viewed in your dashboard and loyalty history.',
  },
  {
    q: 'How do I get help or contact support?',
    a: 'Use the Sign In option to access your dashboard. For account or reward issues, check your profile and loyalty history. For business or partnership enquiries, reach out through the platform or the contact details provided on monyfest.club.',
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0614] text-white overflow-x-hidden">
      {/* Ambient gradient orbs with subtle float */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-[40%] -left-[20%] w-[90%] h-[90%] rounded-full bg-violet-600/25 blur-[140px]"
          animate={{ x: [0, 15, 0], y: [0, -10, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-[10%] -right-[25%] w-[75%] h-[75%] rounded-full bg-fuchsia-600/20 blur-[120px]"
          animate={{ x: [0, -12, 0], y: [0, 8, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-[20%] left-[5%] w-[65%] h-[65%] rounded-full bg-cyan-500/15 blur-[100px]"
          animate={{ x: [0, 8, 0], y: [0, 12, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-[50%] left-[50%] w-[50%] h-[50%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-[90px]"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Header */}
      <motion.header
        className="relative z-10 border-b border-white/5 backdrop-blur-sm"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <MonyFestLogo variant="header" className="flex-shrink-0" />

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-white/80 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-white/90 hover:text-white hover:bg-white/10" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button
              className={cn(
                'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500',
                'text-white font-semibold border-0 hover:opacity-90 hover:shadow-lg hover:shadow-violet-500/25 transition-all'
              )}
              asChild
            >
              <Link href="/login">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="relative z-10 px-4 pt-20 pb-28 sm:px-6 sm:pt-28 sm:pb-36 lg:px-8">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          initial="initial"
          animate="animate"
          variants={stagger}
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/90 backdrop-blur-sm mb-8"
          >
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span>Loyalty & rewards, reimagined</span>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <MonyFestLogo variant="hero" linkToHome={false} />
          </motion.div>

          <motion.p
            variants={fadeInUp}
            className="mx-auto mt-6 max-w-2xl text-lg text-white/70 sm:text-xl"
          >
            One platform for members, merchants, and agents. Earn points, run campaigns, and grow with a modern loyalty ecosystem built for scale.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Button
              size="lg"
              className={cn(
                'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 text-white font-semibold',
                'hover:opacity-90 hover:shadow-xl hover:shadow-violet-500/30 transition-all h-12 px-8'
              )}
              asChild
            >
              <Link href="/login">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 border-white/30 bg-transparent text-white hover:bg-white/10 hover:border-white/50 px-8"
              asChild
            >
              <Link href="#features">See how it works</Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 border-t border-white/5 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-headline text-3xl font-bold text-white sm:text-4xl">
              Everything you need to grow loyalty
            </h2>
            <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto">
              For members, merchants, and agents — one seamless platform.
            </p>
          </motion.div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Sparkles,
                title: 'Earn rewards',
                description: 'Members earn points and redeem coupons across a network of merchants.',
                gradient: 'from-violet-500/20 to-fuchsia-500/20',
              },
              {
                icon: Store,
                title: 'For businesses',
                description: 'Merchants run offers, track analytics, and boost customer retention.',
                gradient: 'from-fuchsia-500/20 to-cyan-500/20',
              },
              {
                icon: Users,
                title: 'Referrals & agents',
                description: 'Agents grow their network and earn commissions. Everyone wins.',
                gradient: 'from-cyan-500/20 to-violet-500/20',
              },
              {
                icon: TrendingUp,
                title: 'Real insights',
                description: 'Dashboards, payouts, and loyalty analytics in one place.',
                gradient: 'from-rose-500/20 to-violet-500/20',
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={cn(
                  'group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm',
                  'hover:border-white/20 hover:bg-white/[0.08] transition-colors duration-300'
                )}
              >
                <div className={cn('mb-4 inline-flex rounded-xl bg-gradient-to-br p-3', item.gradient)}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-headline text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-white/70">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative z-10 border-t border-white/5 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <motion.h2
            className="font-headline text-2xl font-bold text-white sm:text-3xl"
            {...fadeInUpView}
          >
            How it works
          </motion.h2>
          <motion.p className="mt-2 text-white/70" {...fadeInUpView}>
            Sign up, choose your role, and start in minutes.
          </motion.p>
          <div className="mt-10 grid gap-8 sm:grid-cols-3 text-left">
            {[
              { num: '1', color: 'text-violet-400', title: 'Create an account', desc: 'Sign up as a member, merchant, or agent.' },
              { num: '2', color: 'text-fuchsia-400', title: 'Get started', desc: 'Onboard and connect your business or profile.' },
              { num: '3', color: 'text-cyan-400', title: 'Earn & grow', desc: 'Run campaigns, refer others, and track rewards.' },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="rounded-xl border border-white/10 bg-white/5 p-6"
              >
                <span className={cn('text-2xl font-headline font-bold', step.color)}>{step.num}</span>
                <h3 className="mt-2 font-headline font-semibold text-white">{step.title}</h3>
                <p className="mt-1 text-sm text-white/70">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* For business CTA strip */}
      <section id="for-business" className="relative z-10 border-t border-white/5 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/10 to-cyan-500/10 p-8 sm:p-12 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <Shield className="mx-auto h-12 w-12 text-cyan-400" />
            </motion.div>
            <h2 className="font-headline mt-4 text-2xl font-bold text-white sm:text-3xl">
              Ready to get started?
            </h2>
            <p className="mt-2 text-white/70">
              Join as a merchant, agent, or member. One account, one platform.
            </p>
            <div className="mt-8">
              <Button
                size="lg"
                className={cn(
                  'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 text-white font-semibold',
                  'hover:opacity-90 hover:shadow-xl hover:shadow-violet-500/30'
                )}
                asChild
              >
                <Link href="/login">
                  Create your account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faqs" className="relative z-10 border-t border-white/5 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.4 }}
          >
            <div className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/90 backdrop-blur-sm mb-4">
              <HelpCircle className="h-4 w-4 text-cyan-400" />
              <span>Got questions?</span>
            </div>
            <h2 className="font-headline text-2xl font-bold text-white sm:text-3xl">Frequently asked questions</h2>
            <p className="mt-2 text-white/70">Quick answers about MonyFest, rewards, and how to get started.</p>
          </motion.div>

          <Accordion type="single" collapsible className="w-full space-y-2">
            {FAQ_ITEMS.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-10px' }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
              >
                <AccordionItem
                  value={`faq-${index}`}
                  className={cn(
                    'border border-white/10 rounded-xl bg-white/5 px-4 backdrop-blur-sm overflow-hidden',
                    'hover:border-white/20 hover:bg-white/[0.08] transition-colors duration-300'
                  )}
                >
                  <AccordionTrigger className="text-left text-white py-5 font-headline font-semibold hover:no-underline hover:text-white/90 [&[data-state=open]]:text-white">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-white/70 text-sm sm:text-base leading-relaxed pb-5 pt-0">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </section>

      {/* About */}
      <section id="about" className="relative z-10 border-t border-white/5 py-16 sm:py-20">
        <motion.div
          className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-headline text-2xl font-bold text-white sm:text-3xl">About MonyFest</h2>
          <p className="mt-4 text-white/70 leading-relaxed">
            A production-ready loyalty platform that brings together members, merchants, and agents.
            We help businesses reward customers, grow referrals, and run campaigns — all in one modern ecosystem.
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <MonyFestLogo variant="footer" />
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/60">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#faqs" className="hover:text-white transition-colors">FAQs</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
              <Link href="/refunds" className="hover:text-white transition-colors">Refunds Policy</Link>
              <Link href="/shipping" className="hover:text-white transition-colors">Shipping Policy</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            </div>
          </div>
          <p className="mx-auto mt-6 max-w-6xl px-4 text-center text-xs text-white/40">
            © {new Date().getFullYear()} <MonyFestWordmark className="text-xs" />. A production-ready loyalty platform.
          </p>
        </div>
      </footer>
    </div>
  );
}
