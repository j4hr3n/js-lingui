import * as R from "ramda"
import { createBrowserCompiledCatalog } from "./browserCompiler"
import PARSERS from "./minimalParser"

type RemoteLoaderOpts<T> = {
  format?: "minimal"
  fallbackMessages?: string | Record<string, any> | T
  messages: string | Record<string, any> | T
}

function remoteLoader<T>({
  format = "minimal",
  fallbackMessages,
  messages,
}: RemoteLoaderOpts<T>) {
  let parsedMessages: any
  let parsedFallbackMessages: any

  if (format) {
    const formatter = PARSERS[format]
    if (fallbackMessages) {
      // we do this because, people could just import the fallback and import the ./en/messages.js
      // generated by lingui and the use case of format .po but fallback as .json module could be perfectly valid
      parsedFallbackMessages =
        typeof fallbackMessages === "object"
          ? PARSERS.minimal(fallbackMessages)
          : formatter(fallbackMessages)
    }

    parsedMessages = formatter(messages)
  } else {
    throw new Error(`
        *format* value in the Lingui configuration is required to make this loader 100% functional
        Read more about this here: https://lingui.dev/ref/conf#format
      `)
  }

  // todo: that will not work with context
  const mapTranslationsToInterporlatedString = R.mapObjIndexed((_, key) => {
    // if there's fallback and translation is empty, return the fallback
    if (
      parsedMessages[key].translation === "" &&
      parsedFallbackMessages?.[key]?.translation
    ) {
      return parsedFallbackMessages[key].translation
    }

    return parsedMessages[key].translation
  }, parsedMessages)

  return createBrowserCompiledCatalog(mapTranslationsToInterporlatedString)
}

export { remoteLoader }
