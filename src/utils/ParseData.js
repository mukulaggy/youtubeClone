import axios from "axios";
import { parseVideoDuration } from "./parseVideoDuration";
import { convertRawToString } from "./ConvertRawToString";
import { timeSince } from "./timeSince";

const API_KEY = process.env.REACT_APP_YOUTUBE_DATA_API_KEY;

export const parseData = async (items) => {
  try {
    // Step 1: Extract video and channel IDs from items
    const videoIds = items.map((item) => item.id.videoId);
    const channelIds = items.map((item) => item.snippet.channelId);

    // Step 2: Fetch channel details
    const channelsResponse = await axios.get(
      `https://youtube.googleapis.com/youtube/v3/channels?part=snippet,contentDetails&id=${channelIds.join(
        ","
      )}&key=${API_KEY}`
    );
    const channelsData = channelsResponse.data.items;

    // Step 3: Format channel data
    const parsedChannelsData = channelsData.map((channel) => ({
      id: channel.id,
      image: channel.snippet.thumbnails.default.url,
    }));

    // Step 4: Fetch video details
    const videosResponse = await axios.get(
      `https://youtube.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds.join(
        ","
      )}&key=${API_KEY}`
    );
    const videosData = videosResponse.data.items;

    // Step 5: Combine and parse data
    const parsedData = items.map((item, index) => {
      const channel = parsedChannelsData.find(
        (channel) => channel.id === item.snippet.channelId
      );
      const video = videosData[index];

      return {
        videoId: item.id.videoId,
        videoTitle: item.snippet.title,
        videoDescription: item.snippet.description,
        videoThumbnail: item.snippet.thumbnails.medium.url,
        videoLink: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        videoDuration: parseVideoDuration(video.contentDetails.duration),
        videoViews: convertRawToString(video.statistics.viewCount),
        videoAge: timeSince(new Date(item.snippet.publishedAt)),
        channelInfo: {
          id: item.snippet.channelId,
          image: channel.image,
          name: item.snippet.channelTitle,
        },
      };
    });

    return parsedData;
  } catch (err) {
    console.error(err);
  }
};
