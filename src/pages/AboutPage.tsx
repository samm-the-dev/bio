import { PageHeader } from '@/components/PageHeader';

export function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="About Me" />

      <div className="space-y-10">
        <section>
          <h2 className="mb-3 text-xl font-semibold">Improv</h2>
          <p className="text-muted-foreground">
            Improv helped me crawl out of a deep dark hole after the pandemic. Through improv I've
            made more friends in a couple of years than I did in the previous 10+ years.
          </p>
          <p className="mt-3 text-muted-foreground">
            I started with{' '}
            <a
              href="https://www.improvact.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              The Alternative Comedy Theater
            </a>{' '}
            in summer 2024, training in both short and long form improv, and I'm currently training
            with{' '}
            <a
              href="https://stompinggroundcomedy.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              Stomping Ground Comedy Theater
            </a>
            {'.'} I regularly perform with ACT in a show called Goofs & Goblins, which is a
            D&D-themed long-form show every second Tuesday of the month at{' '}
            <a
              href="https://www.pocketsandwich.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              Pocket Sandwich Theatre
            </a>
            {'.'}
          </p>
          <p className="mt-3 text-muted-foreground">
            I attended{' '}
            <a
              href="https://oobfest.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              Out of Bounds
            </a>{' '}
            in Austin in 2025 and had an absolute blast seeing shows, taking workshops, and
            generally hanging out and connecting with comedy people. I even got my first tattoos
            during one of the after-parties. I plan to attend again in 2026, and I'm hoping to make
            it to some other festivals as well.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">Movies</h2>
          <p className="text-muted-foreground">
            I've loved movies since I was a teenager, maybe even longer. I used to ride my bike
            across town to the dollar theater, and once I started driving and working I'd regularly
            go to Blockbuster. Recently I've been more ambitious with my cinephilia, watching 60+
            new releases in 2025 and targeting 100 in 2026.
          </p>
          <p className="mt-3 text-muted-foreground">
            I'm an{' '}
            <a
              href="https://drafthouse.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              Alamo Drafthouse
            </a>{' '}
            regular, Season Pass holder, and I typically go there at least once a week. If you have
            one near you, check 'em out, and make sure you get there a half-hour early for the
            pre-show reel.
          </p>
          <p className="mt-3 text-muted-foreground">
            I log most things I watch on{' '}
            <a
              href="https://letterboxd.com/samm_loves_film/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              Letterboxd
            </a>
            {'.'} I'll be embedding some Letterboxd statistics and lists here soon.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">TTRPGs</h2>
          <p className="text-muted-foreground">
            D&D was my first real long-lasting social hobby. I didn't get into it until my mid-20s,
            but since then I haven't stopped loving TTRPGs. I became obsessed with building
            characters and discovering their stories. The way game mechanics shape storytelling
            fascinates me.
          </p>
          <p className="mt-3 text-muted-foreground">
            I've played{' '}
            <a
              href="https://www.dndbeyond.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              D&D 5e
            </a>
            {','}{' '}
            <a
              href="https://paizo.com/pathfinder"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              Pathfinder 2e
            </a>
            {','} several{' '}
            <a
              href="https://en.wikipedia.org/wiki/Powered_by_the_Apocalypse"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              PbtA
            </a>{' '}
            systems, and many others.
          </p>
          <p className="mt-3 text-muted-foreground">
            Stay tuned for multiple TTRPG projects, both systems and tools.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">Code</h2>
          <p className="text-muted-foreground">
            My web dev journey began in 2014 at an{' '}
            <a
              href="https://www.improving.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              Improving
            </a>{' '}
            boot camp. There I learned full stack web development using the Microsoft stack. I've
            since moved from Angular to React, and now most of my projects are built with React.
          </p>
          <p className="mt-3 text-muted-foreground">
            I love developing simple, useful web apps as a way to grow and sharpen my skills. Check
            out my{' '}
            <a href="/projects" className="underline hover:text-foreground">
              Projects
            </a>{' '}
            page for recent work or my{' '}
            <a
              href="https://github.com/samm-the-dev"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              GitHub
            </a>{' '}
            for repos both new and old.
          </p>
          <p className="mt-3 text-muted-foreground">
            This site and most of my projects were developed with the assistance of{' '}
            <a
              href="https://claude.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              Claude AI
            </a>
            {'.'} The vast majority of the prose was written by me, but I generally lean on Claude
            for brainstorming, editing, and overcoming writer's block. It helps me be more
            productive and creative, while preserving my authentic voice and vision.
          </p>
        </section>
      </div>
    </div>
  );
}
