
export default class kafkaUtil {
    static buildTopicId(clusterId: number | string, topicName: string) {
        return `${clusterId}:${topicName}`
    }

    static extraTopicId(topicId: string): [number, string] {
        const index = topicId.indexOf(':')
        return [parseInt(topicId.substring(0, index), 10), topicId.substring(index + 1)]
    }
}
