import PropTypes from 'prop-types';

const NewsCard = ({ article }) => {
  const { title, description, urlToImage, url } = article;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <a href={url} target="_blank" rel="noopener noreferrer">
        <img
          src={urlToImage || '/placeholder.png'}
          alt={title}
          className="w-full h-48 object-cover object-center"
        />
      </a>
      <div className="p-4">
        <h2 className="text-gray-900 font-bold text-lg mb-2">{title}</h2>
        <p className="text-gray-700 text-sm">{description}</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 font-semibold mt-2 inline-block"
        >
          Read more &rarr;
        </a>
      </div>
    </div>
  );
};

NewsCard.propTypes = {
  article: PropTypes.object.isRequired,
};

export default NewsCard;