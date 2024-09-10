// app/components/LanguageSelector.tsx
import React from "react";
import { Adapt, Select, Sheet, XStack, YStack, getFontSize } from "tamagui";
import { Check, ChevronDown, ChevronUp } from "@tamagui/lucide-icons";
import { LinearGradient } from "@tamagui/linear-gradient";
import { useLanguage } from "../contexts/LanguageContext";
import { useTranslation } from "../hooks/useTranslation";

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <Select value={language} onValueChange={setLanguage}>
      <Select.Trigger width={220} iconAfter={ChevronDown}>
        <Select.Value placeholder={t("changeLanguage")} />
      </Select.Trigger>

      <Adapt when="sm" platform="touch">
        <Sheet
          snapPoints={[20]}
          modal
          dismissOnSnapToBottom
          animationConfig={{
            type: "spring",
            damping: 20,
            mass: 1.2,
            stiffness: 250,
          }}
        >
          <Sheet.Frame>
            <Sheet.ScrollView>
              <Adapt.Contents />
            </Sheet.ScrollView>
          </Sheet.Frame>
          <Sheet.Overlay
            animation="lazy"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
        </Sheet>
      </Adapt>

      <Select.Content zIndex={200000}>
        <Select.ScrollUpButton
          alignItems="center"
          justifyContent="center"
          position="relative"
          width="100%"
          height="$3"
        >
          <YStack zIndex={10}>
            <ChevronUp size={20} />
          </YStack>
          <LinearGradient
            start={[0, 0]}
            end={[0, 1]}
            fullscreen
            colors={["$background", "transparent"]}
            borderRadius="$4"
          />
        </Select.ScrollUpButton>

        <Select.Viewport minWidth={200}>
          <Select.Group>
            <Select.Label>Languages</Select.Label>
            {React.useMemo(
              () =>
                [
                  { code: "en", name: "English" },
                  { code: "th", name: "Thai" },
                ].map((item, i) => (
                  <Select.Item index={i} key={item.code} value={item.code}>
                    <Select.ItemText>{item.name}</Select.ItemText>
                    <Select.ItemIndicator marginLeft="auto">
                      <Check size={16} />
                    </Select.ItemIndicator>
                  </Select.Item>
                )),
              []
            )}
          </Select.Group>
        </Select.Viewport>

        <Select.ScrollDownButton
          alignItems="center"
          justifyContent="center"
          position="relative"
          width="100%"
          height="$3"
        >
          <YStack zIndex={10}>
            <ChevronDown size={20} />
          </YStack>
          <LinearGradient
            start={[0, 0]}
            end={[0, 1]}
            fullscreen
            colors={["transparent", "$background"]}
            borderRadius="$4"
          />
        </Select.ScrollDownButton>
      </Select.Content>
    </Select>
  );
};
