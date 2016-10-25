library(RJSONIO)

getKmeans <- function (o) {
    o <- fromJSON(o)

    k <- as.numeric(o$param)[1]
    dim <- as.numeric(o$dim)[1]
    path <- "~/interactive-visualization-tool/uploads/tmp.csv"

    d <- read.table(path, header=FALSE, sep=",", encoding="UTF-8")

    if (dim == 2) {
        data <- scale(d[1:2])
    } else if (dim ==3) {
        data <- scale(d[1:3])
    }

    kc <- kmeans(data, k)
    d$cluster <- kc$cluster
    return(toJSON(d))
}

getDbscan <- function (o) {
    o <- fromJSON(o)

    eps <- as.numeric(o$param)[1]
    minpts <- as.numeric(o$param)[2]
    dim <- as.numeric(o$dim)[1]
    path <- "~/interactive-visualization-tool/uploads/tmp.csv"

    d <- read.table(path, header=FALSE, sep=",", encoding="UTF-8")

    if (dim == 2) {
        data <- scale(d[1:2])
    } else if (dim ==3) {
        data <- scale(d[1:3])
    }

    kc <- dbscan(data, eps, minpts)
    d$cluster <- kc$cluster
    return(toJSON(d))
}