import React, { useState, useCallback, useEffect } from "react";
import { RefreshControl, useWindowDimensions } from "react-native";
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
import RenderHtml from "react-native-render-html";

import PocketBase from "pocketbase";
import { useTranslation } from "../hooks/useTranslation";

const pb = new PocketBase("http://141.98.17.52");

interface NewsItem {
  id: string;
  title: string;
  content: string;
  image: string;
  created: string;
  collectionId: string;
  collectionName: string;
  updated: string;
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

const NewsItem = ({ title, summary, image, onPress }: any) => {
  const { width } = useWindowDimensions();

  return (
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
          <RenderHtml
            contentWidth={width - 32} // Adjust based on your padding
            source={{ html: summary }}
          />
        </YStack>
      </Card.Footer>
      <Card.Background />
    </Card>
  );
};

export default function NewsScreen() {
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const tabBarHeight = useBottomTabBarHeight();
  const { width } = useWindowDimensions();
  const { t } = useTranslation();

  //const getdata = async () => {
  //  try {
  //    // Simulating fetching data from your provided array
  //    const records: NewsItem[] = [
  //      {
  //        collectionId: "p265ps9dzmbcz0l",
  //        collectionName: "news",
  //        content:
  //          "<p><strong>Tiptap</strong> is an editor framework designed for creating custom content experiences. Integrate content AI, collaborative editing and commenting functionalities into your tech stack with a few lines of code.</p><p>Explore countless extensions with a focus on easy extensibility with our flexible APIs and minimal code changes.</p>",
  //        created: "2024-08-10 09:07:54.315Z",
  //        id: "nxglakpc0q9bjrc",
  //        image: "gua_g_iw8_aez_ia1_NFFe036XMX.jpeg",
  //        title: "Tiptab",
  //        updated: "2024-08-10 09:07:54.315Z",
  //      },
  //    ];
  //    setNewsData(records);
  //  } catch (error) {
  //    console.error("Error fetching news data:", error);
  //  }
  //};

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
      <H2 textAlign="center">{t("newsfeed")}</H2>
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
            image={`${pb.baseUrl}/api/files/${item.collectionId}/${item.id}/${item.image}`}
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
                    uri: `${pb.baseUrl}/api/files/${selectedNews.collectionId}/${selectedNews.id}/${selectedNews.image}`,
                  }}
                  width="100%"
                  height={200}
                  resizeMode="cover"
                />
                <H2>{selectedNews.title}</H2>
                <RenderHtml
                  contentWidth={width - 32} // Adjust based on your padding
                  source={{ html: selectedNews.content }}
                />
              </YStack>
            )}
          </ScrollView>
        </Sheet.Frame>
      </Sheet>
    </YStack>
  );
}
