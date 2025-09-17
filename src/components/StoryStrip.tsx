import { motion } from 'framer-motion';

interface Story {
  id: string;
  title: string;
  image: string;
  productId: string;
}

interface StoryStripProps {
  stories: Story[];
  onOpenStory: (storyIndex: number) => void;
}

export function StoryStrip({ stories, onOpenStory }: StoryStripProps) {
  return (
    <div className="w-full overflow-x-auto py-4 px-4 scrollbar-hide">
      <div className="flex gap-4 w-max">
        {stories.map((story, index) => (
          <motion.button
            key={story.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            onClick={() => onOpenStory(index)}
            className="flex-shrink-0 group"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-pink-200 p-0.5">
                <div className="w-full h-full rounded-full overflow-hidden">
                  <img 
                    src={story.image} 
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                    loading="eager"
                    decoding="async"
                  />
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-overlay rounded-full" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}