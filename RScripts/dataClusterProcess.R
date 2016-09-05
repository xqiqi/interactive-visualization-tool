library(RJSONIO)

getCluster <- function (o) {
    o <- fromJSON(o)

    k <- as.numeric(o$k)[1]
    ignored <- as.logical(o$ignored)
    dim <- as.numeric(o$dim)[1]
    path <- "~/interactive-visualization-tool/uploads/tmp.csv"

    d <- read.table(path, header=FALSE, sep=",", encoding="UTF-8")

    if (dim == 2) {
        data <- d[1:2]

        if (ignored[1] == TRUE) {
            data <- subset(data, select=-V1)
        }
        if (ignored[2] == TRUE) {
            data <- subset(data, select=-V2)
        }
    } else if (dim ==3) {
        data <- d[1:3]

        if (ignored[1] == TRUE) {
            data <- subset(data, select=-V1)
        }
        if (ignored[2] == TRUE) {
            data <- subset(data, select=-V2)
        }
        if (ignored[3] == TRUE) {
            data <- subset(data, select=-V3)
        }
    }

    kc <- kmeans(data, k)
    d$cluster <- kc$cluster
    return(toJSON(d))
}