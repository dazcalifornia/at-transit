import React, { useState, useCallback, useEffect } from "react";
import { RefreshControl } from "react-native";
import { ChevronRight, Bell, Info } from "@tamagui/lucide-icons";
import {
  YStack,
  H2,
  ListItem,
  Switch,
  SizableText,
  Separator,
  XStack,
  Image,
  ScrollView,
  Card,
  Button,
  Text,
  Sheet,
  Paragraph,
} from "tamagui";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import PocketBase from "pocketbase";

const pb = new PocketBase("http://141.98.17.52");

interface NewsItem {
  id: string;
  title: string;
  content: string;
  image: string;
  created: string;
}

const isThai = (text: string) => /[\u0E00-\u0E7F]/.test(text);

const summarizeNews = (fullContent: string, maxLength = 200) => {
  // Check if fullContent is defined and is a string
  if (typeof fullContent !== "string" || !fullContent) {
    return "No content available. / ไม่มีเนื้อหา";
  }

  const language = isThai(fullContent) ? "thai" : "english";

  // Split the content into sentences
  const sentences =
    language === "thai"
      ? fullContent.match(/[^。．！？]+[。．！？]+/g) || []
      : fullContent.match(/[^\.!\?]+[\.!\?]+/g) || [];

  let summary = "";
  let currentLength = 0;

  // Add sentences to the summary until we reach the maxLength
  for (let sentence of sentences) {
    if (currentLength + sentence.length <= maxLength) {
      summary += sentence + " ";
      currentLength += sentence.length;
    } else {
      break;
    }
  }

  // Trim any extra spaces and add ellipsis if the summary is shorter than the full content
  summary = summary.trim();
  if (summary.length < fullContent.length) {
    summary += language === "thai" ? "...อ่านต่อ" : "...อ่านต่อ";
  }

  return summary;
};

const NewsItem = ({ title, summary, image, onPress }) => (
  <Card
    elevate
    size="$4"
    bordered
    mb="$4"
    scale={0.9}
    hoverStyle={{ scale: 0.925 }}
    onPress={onPress}
  >
    <Card.Header padded>
      <Image
        source={{ uri: image }}
        width="100%"
        height={200}
        resizeMode="cover"
      />
    </Card.Header>
    <Card.Footer padded>
      <YStack space="$2">
        <SizableText fontWeight="bold" fontSize="$5">
          {title}
        </SizableText>
        <SizableText fontSize="$3">{summary}</SizableText>
      </YStack>
    </Card.Footer>
    <Card.Background />
  </Card>
);

export default function NewsScreen() {
  const [newsData, setNewsData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const tabBarHeight = useBottomTabBarHeight();

  const getdata = async () => {
    const records = await pb.collection("news").getFullList({
      sort: "-created",
    });
    setNewsData(records);

    console.log("rnew: ", records);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getdata();
    setRefreshing(false);
  }, [getdata]);

  useEffect(() => {
    getdata();
  }, []);

  const handleNewsPress = (news: NewsItem) => {
    setSelectedNews(news);
    setSheetOpen(true);
  };

  return (
    <YStack f={1} p="$4" space="$4" pt="$10" backgroundColor="$background">
      <H2 textAlign="center">News Feed</H2>
      <Separator />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={{ marginBottom: tabBarHeight }}
      >
        {newsData.map((item) => (
          <NewsItem
            key={item.id}
            title={item.title}
            summary={summarizeNews(item.content)}
            image={pb.files.getUrl(item, item.image)}
            onPress={() => handleNewsPress(item)}
          />
        ))}
      </ScrollView>
      <Sheet
        modal
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        snapPoints={[80]}
      >
        <Sheet.Overlay />
        <Sheet.Frame>
          <Sheet.Handle />
          <ScrollView>
            {selectedNews && (
              <YStack padding="$4" space="$4">
                <Image
                  source={{
                    uri: pb.files.getUrl(selectedNews, selectedNews.image),
                  }}
                  width="100%"
                  height={200}
                  resizeMode="cover"
                />
                <H2>{selectedNews.title}</H2>
                <Paragraph>
                  {summarizeNews(selectedNews.content, 150)}
                </Paragraph>
                <Paragraph>{selectedNews.content}</Paragraph>
              </YStack>
            )}
          </ScrollView>
        </Sheet.Frame>
      </Sheet>
    </YStack>
  );
}
