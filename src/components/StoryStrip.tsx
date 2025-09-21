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

// Attempt to generate an optimized thumbnail URL for Cloudinary-style URLs.
// If not Cloudinary, fall back to the original URL.
function getThumb(url: string, size = 64) {
  try {
    // Cloudinary delivery URLs typically contain '/upload/' segment
    if (url.includes('/upload/')) {
      // Simple resize transform - just add width and height
      return url.replace('/upload/', `/upload/w_${size},h_${size},c_fill/`);
    }
  } catch (_) {
    // noop
  }
  return url;
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
                    src={getThumb(story.image, 64)}
                    srcSet={[
                      `${getThumb(story.image, 48)} 48w`,
                      `${getThumb(story.image, 64)} 64w`,
                      `${getThumb(story.image, 96)} 96w`,
                    ].join(', ')}
                    sizes="64px"
                    alt={story.title}
                    width={64}
                    height={64}
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